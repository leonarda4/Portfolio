export type GraphicTheme = 'dark' | 'light';
export const themes = {
 dark: {'--echo-bg':'#101112','--echo-ink':'#e7e9e5','--echo-muted':'#92969b','--echo-line':'#727876','--echo-faint':'#42484a'},
 light: {'--echo-bg':'#eeeeee','--echo-ink':'#111111','--echo-muted':'#44494b','--echo-line':'#606668','--echo-faint':'#969b9d'},
};
export const theme = {bg:'var(--echo-bg)',white:'var(--echo-ink)',muted:'var(--echo-muted)',line:'var(--echo-line)',faint:'var(--echo-faint)',font:'Helvetica Neue, Helvetica, Arial, sans-serif'};
export const type = {label:28};
