/* =========================================================
   Tweaks app — drives readability + accent CSS variables.
   The page itself is static HTML/CSS; this only mounts the
   Tweaks panel and writes custom properties on :root.
   ========================================================= */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "bodySize": 17,
  "labelSize": 13,
  "lineHeight": 1.6,
  "accent": "#cf6a3c"
}/*EDITMODE-END*/;

function px(n) { return (n / 16) + "rem"; }

function TweakApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--fs-base", px(t.bodySize));
    r.setProperty("--fs-label", px(t.labelSize));
    r.setProperty("--fs-label-lg", px(t.labelSize + 1));
    document.body.style.lineHeight = String(t.lineHeight);
    r.setProperty("--flame", t.accent);
  }, [t.bodySize, t.labelSize, t.lineHeight, t.accent]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Readability" />
      <TweakSlider label="Body text" value={t.bodySize} min={15} max={21} step={0.5} unit="px"
                   onChange={(v) => setTweak("bodySize", v)} />
      <TweakSlider label="Label text" value={t.labelSize} min={12} max={16} step={0.5} unit="px"
                   onChange={(v) => setTweak("labelSize", v)} />
      <TweakSlider label="Line height" value={t.lineHeight} min={1.4} max={1.9} step={0.05}
                   onChange={(v) => setTweak("lineHeight", v)} />
      <TweakSection label="Accent" />
      <TweakColor label="Accent color" value={t.accent}
                  options={["#cf6a3c", "#b8553a", "#3f7d6e", "#5a6abf", "#1f1d1a"]}
                  onChange={(v) => setTweak("accent", v)} />
    </TweaksPanel>
  );
}

(function mountTweaks() {
  const el = document.createElement("div");
  el.id = "tweak-root";
  document.body.appendChild(el);
  ReactDOM.createRoot(el).render(<TweakApp />);
})();
