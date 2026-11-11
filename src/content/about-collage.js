// Leonarda's original notes and strokes, promoted to permanent About me content.
// Coordinates use the original 1002px content column; drawing paths live in the SVGs.
export const aboutNotes = [
  {
    "key": "school",
    "id": "d875808f-0350-4eb3-8fad-fd6a965268a1",
    "text": "I was programming in Python in high school",
    "color": "Mint",
    "x": 465,
    "y": 124
  },
  {
    "key": "degree",
    "id": "d8f9c620-ea56-4360-bd59-a94312bde9da",
    "text": "Went to do a BSc in Computer Science\n- everyone was doing it @ FER Zagreb :,)",
    "color": "Yellow",
    "x": 573.5,
    "y": 215.5
  },
  {
    "key": "discovery",
    "id": "84d6097b-6126-43a4-ba78-e6303b969122",
    "text": "Realized that I wanted to make fun things and really research what to build - not just how",
    "color": "Blue",
    "x": 331.8,
    "y": 353.8
  },
  {
    "key": "design",
    "id": "0d13f4c5-366e-4577-9ac1-82db7065ff30",
    "text": "Taught myself design tools, made a bunch of projects, and won some competitions",
    "color": "Peach",
    "x": 643.2,
    "y": 443.8
  },
  {
    "key": "job",
    "id": "9b03f958-343f-4116-b091-5eb90e7a2e27",
    "text": "Got my first UX job, initially as an internship, but took on more responsibility as time went on",
    "color": "Yellow",
    "x": 393.51,
    "y": 601.83
  },
  {
    "key": "erasmus",
    "id": "71e21ccb-1a98-490e-872c-ffd0b2e7e2e1",
    "text": "Went on Erasmus to do a semester in Creative Tech @ the University of Twente in the Netherlands",
    "color": "Mint",
    "x": 61.31,
    "y": 560.87
  },
  {
    "key": "masters",
    "id": "f59f3600-1a76-480b-bb82-7bb0dd79f286",
    "text": "Now doing an MA in Interaction Design at ZHdK Zurich :))",
    "color": "Pink",
    "x": -113.08,
    "y": 237.11
  }
]

export const aboutDrawings = [
  {
    "key": "loop-arrow",
    "src": "/assets/about/loop-arrow.svg",
    "x": -121,
    "y": 448,
    "width": 147,
    "height": 240
  },
  {
    "key": "trail",
    "src": "/assets/about/trail.svg",
    "x": 594,
    "y": 594,
    "width": 348,
    "height": 211
  }
]

export const aboutNoteIds = new Set(aboutNotes.map(note => note.id))
export const aboutDrawingIds = new Set([
  "69d2df21-61fa-4c91-b536-5324a9990d87",
  "0f261c1a-c2e3-438f-b4f4-f432643dc24f",
  "1141da18-5ff3-4f9e-9cca-ed262c28d4f8",
  "0bc64ce8-29e9-45e9-b70c-8e4100948d74",
  "acac7d19-f643-4a32-8f5c-0bd3488fe3ab",
  "63befb65-40f1-4ce4-ae01-52ebb080ddcf",
  "349db47e-c423-40f8-9e94-b33659237bd2",
  "c34b5f14-5a63-47c7-bcc6-57ded3bfbb34",
  "89805fd5-7d53-4910-af48-7412c60f9ddc",
  "0f720a7d-fcbb-4f9a-a6a1-db057d73b9af",
  "97a15459-a206-4043-b42e-7562737ea168",
  "6342847c-20c6-4e2c-a820-d9722d536d58",
  "9f853e4d-be8c-4160-b802-63220d26a992",
  "474cb339-4053-4998-99f8-e1db713e0cd7",
  "3c5ac497-7d2e-4d57-b398-c88a5b2634c4",
  "1895d4c3-7aaf-4e86-b74e-c3c82e794ccd",
  "32e6fd73-0938-4f23-a53c-affe59040a0e",
  "71d837d5-666f-4891-abc4-448622c92cc8",
  "ed72b2e0-531d-43d3-9ba1-830db5906c6e",
  "403ea17d-b23b-4b39-aeb2-c16be6ed1848"
])
