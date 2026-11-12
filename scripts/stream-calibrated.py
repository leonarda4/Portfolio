"""Create aligned four-second HLS segments in 360p, 480p, 720p, and Full HD."""
from pathlib import Path
import hashlib
import json
import subprocess
import imageio_ffmpeg

root = Path(__file__).resolve().parents[1]
source = root / 'public/assets/calibrated/calibrated-experience.mp4'
version = hashlib.sha256(source.read_bytes() + b'hls-4s-360-480-720-1080-crf22-v2').hexdigest()[:12]
output = root / 'public/assets/optimized' / f'calibrated-stream-{version}'
output.mkdir(exist_ok=True)
master = ['#EXTM3U', '#EXT-X-VERSION:7', '#EXT-X-INDEPENDENT-SEGMENTS']
for height, width, bitrate in [(360, 640, 350), (480, 854, 700), (720, 1280, 1600), (1080, 1920, 3500)]:
    folder = output / str(height)
    folder.mkdir(exist_ok=True)
    if not (folder / 'index.m3u8').exists():
        subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source),
            '-map', '0:v:0', '-map', '0:a:0', '-vf', f'scale={width}:{height}',
            '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-maxrate', f'{bitrate}k', '-bufsize', f'{bitrate*2}k',
            '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level:v', '4.0', '-g', '96', '-keyint_min', '96', '-sc_threshold', '0',
            '-force_key_frames', 'expr:gte(t,n_forced*4)', '-threads', '4', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000',
            '-f', 'hls', '-hls_time', '4', '-hls_playlist_type', 'vod', '-hls_segment_type', 'fmp4',
            '-hls_flags', 'independent_segments', '-hls_fmp4_init_filename', 'init.mp4',
            '-hls_segment_filename', str(folder / 'segment-%03d.m4s'), str(folder / 'index.m3u8')], check=True)
    master += [f'#EXT-X-STREAM-INF:BANDWIDTH={(bitrate+180)*1000},RESOLUTION={width}x{height},FRAME-RATE=24.000,CODECS="avc1.640028,mp4a.40.2"', f'{height}/index.m3u8']
    print(f'{height}p segments: {sum(p.stat().st_size for p in folder.iterdir())/1e6:.2f} MB', flush=True)
(output / 'master.m3u8').write_text('\n'.join(master) + '\n')
(root / 'src/content/calibrated-stream.json').write_text(json.dumps({'src': '/assets/optimized/' + output.name + '/master.m3u8'}, indent=2) + '\n')
