"""Build responsive WebP images and streaming MP4s without changing originals.

Run in an environment with Pillow and imageio-ffmpeg installed.
Outputs use content hashes so they can be cached permanently.
"""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib
import json
import re
import subprocess
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
OUTPUT = PUBLIC / 'assets/optimized'
OUTPUT.mkdir(exist_ok=True)
manifest = {'images': {}, 'videos': {}}
images = {'/assets/portrait.jpg'}


def collect(value):
    if isinstance(value, dict):
        for item in value.values():
            collect(item)
    elif isinstance(value, list):
        for item in value:
            collect(item)
    elif isinstance(value, str) and value.startswith('/assets/') and Path(value).suffix.lower() in {'.png', '.jpg', '.jpeg', '.webp'}:
        images.add(value)


for path in (ROOT / 'src/content').glob('project-*.json'):
    collect(json.loads(path.read_text()))
for folder in ['professor-feathers', 'reticulations']:
    images.add(f'/assets/{folder}/preview.jpg')
# Also cover process photos moved between the metadata and collage layouts.
images.update('/' + str(p.relative_to(PUBLIC)) for p in (PUBLIC / 'assets/calibrated/process-photo/web').glob('*.webp'))


def key(path, settings):
    return hashlib.sha256(path.read_bytes() + settings.encode()).hexdigest()[:12]


for source in sorted(images):
    path = PUBLIC / source.lstrip('/')
    if not path.exists():
        continue
    original = ImageOps.exif_transpose(Image.open(path))
    if original.mode not in ('RGB', 'RGBA'):
        original = original.convert('RGB')
    width, height = original.size
    name = re.sub(r'[^a-z0-9]+', '-', path.stem.lower()).strip('-')
    versions = []
    for target in sorted(set(min(w, width) for w in [320, 640, 960, 1600])):
        filename = f'{name}-{key(path, f"webp-{target}-82-v1")}-{target}.webp'
        output = OUTPUT / filename
        if not output.exists():
            image = original.resize((target, round(height * target / width)), Image.Resampling.LANCZOS)
            image.save(output, 'WEBP', quality=82, method=6)
        versions.append({'src': f'/assets/optimized/{filename}', 'width': target})
    manifest['images'][source] = {'width': width, 'height': height, 'src': versions[-1]['src'], 'sources': versions}

covers = [
    '/assets/echo-testing/echo-cover.mp4',
    '/assets/calibrated/calibrated-cover-loop.mp4',
    '/assets/professor-feathers/preview.mp4',
    '/assets/reticulations/preview.mp4',
]
films = [
    '/assets/calibrated/calibrated-experience.mp4',
    '/assets/calibrated/process-photo/web/first-calibration.mp4',
    '/assets/calibrated/participant-reactions.mp4',
    '/assets/professor-feathers/Professor Feathers.mp4',
]
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
for source in covers + films:
    path = PUBLIC / source.lstrip('/')
    name = re.sub(r'[^a-z0-9]+', '-', path.stem.lower()).strip('-')
    variants = {}
    for size in ([720, 1280] if source in covers else [1280]):
        settings = f'h264-{size}-crf24-medium-aac128-v1'
        filename = f'{name}-{key(path, settings)}-{size}.mp4'
        output = OUTPUT / filename
        if not output.exists():
            command = [ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(path),
                       '-map', '0:v:0', '-vf', f'scale=w=min({size}\\,iw):h=-2',
                       '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-pix_fmt', 'yuv420p',
                       '-maxrate', '2200k', '-bufsize', '4400k', '-g', '48', '-threads', '4']
            if source in covers:
                command += ['-an']
            else:
                command += ['-map', '0:a?', '-c:a', 'aac', '-b:a', '128k']
            command += ['-movflags', '+faststart', str(output)]
            subprocess.run(command, check=True)
        variants['mobile' if size == 720 else 'src'] = f'/assets/optimized/{filename}'
        print(f'{path.name}: {path.stat().st_size / 1e6:.2f} MB -> {output.stat().st_size / 1e6:.2f} MB ({size}px)', flush=True)
    manifest['videos'][source] = variants

(ROOT / 'src/content/optimized-media.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Built responsive images for {len(manifest["images"])} assets.', flush=True)
