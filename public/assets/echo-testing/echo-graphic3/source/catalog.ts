export const contentCatalog = [
  {id:'contraction-index',title:'Contraction index',caption:'Body expansion and contraction with live and open-pose bounds',group:'studies',scene:'architecture' as const,index:-3},
  {id:'system-architecture',title:'System architecture',caption:'From movement to audiovisual response',group:'system',scene:'architecture' as const,index:-2},
  {id:'feedback-loop',title:'Feedback loop',caption:'Movement, interpretation, response and perception',group:'system',scene:'feedback' as const,index:-2},
  {id:'installation-space',title:'Installation in space',caption:'The participant and the responsive environment',group:'system',scene:'installation' as const,index:-2},
  ...[
    ['overhead-wave','Overhead gesture','Body landmarks during an overhead arm movement'],
    ['phone-capture','Phone capture','Camera input for body pose estimation'],
    ['processing-layers','Processing layers','From pose data to movement features and audiovisual output'],
    ['visual-field','Visual field','A generative surface responding to movement'],
    ['sound-waveform','Sound waveform','The rhythmic amplitude of the audio response'],
    ['body-landmarks','Body landmarks','Tracked joints and connections used to describe movement'],
  ].map(([id,title,caption],i)=>({id,title,caption,group:'studies',scene:'architecture' as const,index:i-1})),
];
export const LOOP_SECONDS = 8;

