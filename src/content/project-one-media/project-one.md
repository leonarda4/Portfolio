# Echo: Audiovisual system reinforcing expressive movement

<!-- Editorial companion; rendered source: ../project-one.json -->

I designed, built, and tested an interactive installation that translates body movement into generative visuals and sound. The challenge was making its responses understandable and expressive while keeping the movement physically sustainable.

**Project type:** Bachelor’s thesis · Research through making

**Team:** Solo design & development · Supervisor: Dario Bojanjac

**Tools:** Python, MediaPipe, React, TypeScript, WebGL/GLSL, Tone.js

**Timeline:** April – June 2026

## Results at a glance

### What the study revealed

Ten participants explored Echo at the Vrijhof gallery. These are their average self-ratings before and after the interaction.

### Changes in participants’ self-ratings

<!-- Chart component: beforeAfter -->

- Body awareness: 2.4 → 4.1
- Happiness: 3.2 → 4.4
- Self-confidence: 3.5 → 4.1

Mean self-ratings before and after · 1–5 scale · n = 10. Immediate self-reported experience; no control group or long-term follow-up.


### Testing embodied interaction at the Vrijhof gallery

![A participant moves through the gallery in front of a blue and green projection.](/assets/echo-testing/korisnik1.jpg?v=fad9b54b07)

![A participant raises their arms in front of a colorful geometric projection.](/assets/echo-testing/korisnik2.jpg?v=3c8b321bfd)

![A participant explores Echo while an observer watches the testing session.](/assets/echo-testing/20260605-153919585.jpg?v=5ec8d8ce19)

![A participant extends both arms in front of a yellow swirling projection.](/assets/echo-testing/echo-cover.jpg?v=67878b26f3)

![A participant wearing headphones faces a blue and green audiovisual projection.](/assets/echo-testing/20260605-153934661.jpg?v=22c3859efe)

![A participant holds a questionnaire beside a projected question about how they feel.](/assets/echo-testing/faza2.jpg?v=9c91609e63)

![A participant wearing headphones faces an orange and purple circular projection during testing.](/assets/echo-testing/faza2_2.jpg?v=a51fe03598)

## Overview

### Can an environment invite expressive movement?

A participant moves, the sound and visuals respond, and that response shapes what they try next. I explored this feedback loop through a working installation, from movement tracking and audiovisual design to prototyping and a ten-person study.

<!-- Graphic: feedback-loop -->

### Six atmospheres shaped by movement

I mapped observable movement qualities to Fear, Determination, Sadness, Happiness, Anger, and Serenity. These are designed associations between movement, sound, and visuals; Echo does not measure someone’s internal emotional state.

Video[Testing Echo at the Vrijhof gallery](/assets/echo-testing/testing.mp4)

What the participant currently sees.

## Research questions

1. What happens when an environment responds to and tries to reinforce the emotion someone expresses through movement?
2. Can a system interpret emotional expression through movement?
3. Can an audiovisual environment amplify emotions?

## Soundscape examples

### Sound layers for six emotional atmospheres

Press play, then mute layers or adjust sliders to hear their contribution.

<!-- Interactive component: soundscapes -->

## Gradient studies

### Color and motion studies for six emotions

Select a study to explore its color and motion.

<!-- Interactive component: gradients -->

## Research foundations

Laban’s movement qualities and Shafir et al.’s work on movement and emotion informed what Echo looks for in a gesture. EyesWeb helped me choose measurable features, while Sievers et al.’s research connected movement and music. Together, these foundations guided the mapping from physical expression to audiovisual atmospheres.

<details>
<summary>Read more</summary>

### Laban: describing how people move

Laban’s Weight, Time, Flow, and Space offered a way to describe how someone moves. Together with Shafir et al.’s work on movement and emotion, this informed my choice to analyze strength, suddenness, continuity, and openness rather than rely on movement quantity alone.

[Laban & Lawrence · Effort, 1947](https://ickl.org/resources/bibliography-of-labans-books/)

[Shafir et al., 2016](https://doi.org/10.3389/fpsyg.2015.02030)

### EyesWeb: choosing measurable features

EyesWeb provided measurable features such as Quantity of Motion, Contraction Index, and fluency. I selected and adapted these features, then designed the rules connecting them to the six emotion categories.

[Camurri et al., 2004](https://doi.org/10.1007/978-3-540-24598-8_42)

### Connecting movement and sound

Sievers et al.’s work on shared dynamics in movement and music informed the connection between physical expression and sound. I used that connection to shape distinct audiovisual atmospheres for the six categories.

[Sievers et al., 2013](https://doi.org/10.1073/pnas.1209023110)

</details>

## Interaction design

### Designing the response around the body

Prototypes helped me refine what the system noticed, how quickly it responded, and how much effort it asked of a person. These decisions shaped whether the interaction felt connected to their movement.

### Keep the effort sustainable

In preliminary testing, the anger prototype called for large, high-energy movements. As the system adapted, that intensity could become the new normal, asking for even more effort to trigger the same response. I revised the calibration before the main study. The lesson was to assess what people could comfortably sustain alongside what the system could recognize.

### Let quick gestures register

Smoothing the tracking data reduced jitter, but it could also hide a brief opening of the arms. I removed that smoothing from the body-openness measurement while retaining it for other movement features, so a quick expansion could still register.

### Respond without constant switching

A change in movement should feel connected to a change in atmosphere. I let a clearly stronger match trigger a quick response; a less decisive match had to persist before the atmosphere changed. This balanced responsiveness with continuity.

### Weight, Time, Flow, and body contraction

<!-- Hidden editorial plan: Movement-quality sliders coming later. -->

### From camera input to audiovisual feedback

A live pipeline connects body tracking, movement analysis, and audiovisual output.

<!-- Graphic: system-architecture -->

## Testing

### Studying the interaction with ten participants

I studied how ten participants understood the feedback, recognized the audiovisual atmospheres, and expressed emotions through movement. Most were students at the University of Twente. This was an exploratory study of experience, not a validation of emotion-detection accuracy.

### Physical installation

Camera-tracked movement, projected visuals, and sound through headphones.

<!-- Graphic: installation-space -->

### Explore, recognize, and express

#### Before interaction

Record initial self-ratings.

#### Explore

Move freely, with no prescribed emotion.

#### Recognize

Identify emotions in sound and visuals.

#### Express

Try expressing emotions through movement.

#### After interaction

Repeat self-ratings and reflect on the experience.

### Participants’ ages and movement experience

#### Age

- 18–24 years: 8
- 25–34 years: 2

#### Experience with similar installations

- Never: 6
- Once: 2
- Several times: 2

#### Dance & expressive movement

- 1 · Never: 3
- Rating 2: 4
- Rating 3: 2
- Rating 4: 1
- 5 · Every day: 0

### Recognition phase

Video[Participant exploring Echo’s projected visuals](/assets/echo-testing/echo-cover.mp4)

Recognizing emotion in sound and visuals.

### Recognizing emotion in the audiovisual output

<!-- Chart component: recognition -->

- Happiness: 9/10
- Anger: 9/10
- Fear: 9/10
- Determination: 9/10
- Serenity: 8/10
- Sadness: 5/10

Recognized / 10 participants: participants identifying the intended emotion from sound and visuals, without performing movements. This measures audiovisual recognition, not the system’s accuracy at reading movement.

### Recognizing an emotion did not make it easy to express

Nine of ten participants recognized determination in the audiovisual output, yet their average self-rating for expressing it through movement was only 2.5/5, the lowest of the six emotions. This suggests that a recognizable atmosphere also needs an approachable way to reach it through movement.

### Sadness needed a more distinct character

Only five of ten participants recognized sadness, and it was most often confused with serenity. Both used slower, softer audiovisual qualities. A next iteration would make their differences clearer and test the revised atmospheres again.


### How participants described their relationship with Echo

<!-- Chart component: participantCounts -->

- A partner: 4/10
- A guide: 3/10
- Unpredictable: 2/10
- A mirror: 1/10

Exit-survey descriptions · one dot per participant · n = 10.

## Participant feedback

### Participant feedback

Verbatim exit responses; participants numbered by response order.

> When the system actually responded to the emotion I was trying to portray i felt the emotion more. It felt less hard to portray the emotion. It felt less like acting and more natural.

Participant 5

> It was something i have never experienced before. Sometimes I wasn't completely sure how to feel or respond to the inputs.

Participant 2

> Really liked it, visually it was striking, felt the emotions conveyed through the music. Installation evoked my emotions

Participant 9

## Reflection

### The interaction must be readable and physically achievable

Building Echo taught me to treat calibration and timing as design decisions. A response can be technically coherent and still ask too much of a body or leave someone unsure how to influence it. I would assess sustained effort and clarity alongside responsiveness in the next iteration.

### What I would test next

I would compare guided and unguided exploration, revisit the movement mapping for determination, and make sadness more distinct from serenity. Each change would need another round of testing; the current study identifies these opportunities rather than demonstrating that they are solved.

<!-- Evidence and authoring notes
Interactive gradient studies follow Soundscape examples. The gallery includes 30 saved Noise Lab recipes: 12 clear matches and 18 similar matches to the supplied reference, arranged as five studies per emotion. Movement-quality sliders remain reserved for a later update.
Participant demographics transcribed from the supplied thesis figure; frequency scale runs from 1 (Never) to 5 (Every day).
Recruiter-focused revision: results precede the photo teaser; research foundations precede decisions and expand from a short overview; interactive sound and visual studies follow the research questions.
Evidence: Leonarda_Lovric_zavrsni_rad.pdf, printed p.16 (PDF p.19): removal of Kalman filtering for CI; printed p.22 (PDF p.25): switching rules; Fig.3.5 p.32 (PDF p.35): recognition; Fig.3.8 p.34 (PDF p.37): determination expression 2.5/5; Fig.3.10 p.35 (PDF p.38): self-ratings; Fig.3.12 p.37 (PDF p.40): relationship descriptions.
The physical-effort/calibration iteration is retained from the existing authored case study. The thesis does not specify the exact before/after calibration change or a measured reduction in effort. Do not invent that detail; the movement comparison is an explicit placeholder.
Participant quotations and response-order attributions are retained verbatim from the existing case study; the thesis discusses these qualitatively but does not reproduce the complete English responses.
-->
