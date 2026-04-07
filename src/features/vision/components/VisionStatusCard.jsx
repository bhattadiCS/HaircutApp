import { Cpu, ScanFace, Sparkles, TriangleAlert } from 'lucide-react';

const visionLabels = {
  idle: 'Ready to read',
  loading: 'Scanning portrait',
  ready: 'Mesh ready',
  tracking: 'Frame locked',
  'no-face': 'Need your face',
  error: 'Vision offline',
};

const aiLabels = {
  idle: 'Concierge staged',
  warming: 'Warming on-device',
  ready: 'Concierge ready',
  degraded: 'Fallback recipe mode',
  unconfigured: 'Prompt mode only',
};

function getCoachingTips(visionState) {
  const { status, metrics, focusBox, faceShape } = visionState;

  if (status === 'loading') {
    return {
      headline: 'Analyzing your framing.',
      tips: [
        'Hold steady for a stylist-grade read.',
        'We are mapping the hairline, jaw balance, and crop.',
      ],
    };
  }

  if (status === 'no-face') {
    return {
      headline: 'Bring your face into the center frame.',
      tips: [
        'Keep the forehead and chin visible.',
        'Step into cleaner light if the read feels patchy.',
      ],
    };
  }

  if (status === 'error') {
    return {
      headline: 'Portrait coaching is unavailable right now.',
      tips: [
        'You can still upload a clear portrait and continue.',
        'The style preview will work without live coaching.',
      ],
    };
  }

  if (status !== 'tracking') {
    return {
      headline: 'Camera vision is standing by.',
      tips: ['Center your face when you are ready.', 'We will guide the crop once the mesh locks in.'],
    };
  }

  let framingTip = `${faceShape} balance reads clearly.`;

  if (focusBox?.width < 0.24) {
    framingTip = 'Move a little closer for a sharper consultation view.';
  } else if (focusBox?.width > 0.58) {
    framingTip = 'Ease back a touch so the full silhouette stays in frame.';
  } else if (focusBox?.centerY < 0.34) {
    framingTip = 'Drop the camera slightly so the hairline sits higher in frame.';
  } else if (focusBox?.centerY > 0.62) {
    framingTip = 'Lift the camera slightly to balance the crop.';
  }

  let alignmentTip = 'Perfect lighting. Hold that pose.';

  if (metrics?.yaw > 0.09) {
    alignmentTip = 'Turn slightly right for a straighter front-on read.';
  } else if (metrics?.yaw < -0.09) {
    alignmentTip = 'Turn slightly left so the outline looks even.';
  } else if (metrics?.pitch > 0.08) {
    alignmentTip = 'Lift your chin a touch for a cleaner taper line.';
  } else if (metrics?.pitch < -0.08) {
    alignmentTip = 'Relax your chin slightly to open the forehead.';
  }

  return {
    headline: 'Stylist coaching is live.',
    tips: [framingTip, alignmentTip],
  };
}

export default function VisionStatusCard({ visionState, aiRuntime }) {
  const coaching = getCoachingTips(visionState);
  const runtimeLabel =
    aiRuntime.status === 'warming'
      ? `Warming on-device ${Math.round(aiRuntime.loadProgress ?? 0)}%`
      : aiLabels[aiRuntime.status] || 'Local AI';

  return (
    <div
      className="glass-panel pointer-events-none absolute left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-sm rounded-[1.2rem] p-3 shadow-xl backdrop-blur-md bg-black/40"
      style={{ top: 'calc(var(--safe-area-top) + 4rem)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
          <ScanFace className="h-4 w-4 text-cyan-300" />
          Stylist Coaching
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
          {visionLabels[visionState.status]}
        </span>
      </div>

      <div className="mt-3 flex items-start gap-2 text-sm text-white">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <div>
          <div className="font-medium text-white">{coaching.headline}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.24em] text-white/45">
            {visionState.faceShape} balance profile
          </div>
        </div>
      </div>

      <div className="mt-2 text-xs leading-relaxed text-white/80 line-clamp-2">
        {coaching.tips[0]}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-white/70">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-fuchsia-300" />
          <span>{runtimeLabel}</span>
        </div>
        <span className="text-white/45">{aiRuntime.device}</span>
      </div>

      {aiRuntime.status === 'warming' ? (
        <div className="mt-3 h-1.5 rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-300"
            style={{ width: `${Math.max(6, Math.round(aiRuntime.loadProgress ?? 0))}%` }}
          />
        </div>
      ) : null}

      {aiRuntime.error ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-[11px] text-amber-100">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{aiRuntime.error}</span>
        </div>
      ) : null}
    </div>
  );
}