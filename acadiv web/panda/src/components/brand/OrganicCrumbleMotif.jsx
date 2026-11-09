/**
 * ACADIV ORGANIC CRUMBLE FRAGMENT MOTIF
 * 4–5 staggered horizontal layers of irregular abstract geometric fragments
 * rising organically from the bottom edge, echoing the Wayfinder architectural identity.
 */

export default function OrganicCrumbleMotif({ className = '', variant = 'footer' }) {
  // 5 staggered horizontal strata of intentionally irregular, un-gridded polygon shapes
  return (
    <div
      className={`organic-crumble-container ${className}`}
      aria-hidden="true"
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        lineHeight: 0,
      }}
    >
      <svg
        viewBox="0 0 1440 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{
          width: '100%',
          height: variant === 'hero' ? '120px' : '160px',
          display: 'block',
        }}
      >
        <defs>
          <linearGradient id="crumbleGradTeal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34B9A5" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#174B43" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="crumbleGradLime" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C7ED69" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#34B9A5" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="crumbleGradForest" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#174B43" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0E2528" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="crumbleGradSage" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DCE2D9" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#C3CCC0" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* LAYER 1: Deep Grounding Base Horizon (Lowest, widest bedrock plates) */}
        <g opacity="0.95">
          <polygon points="-20,180 180,145 320,170 490,140 680,165 890,135 1100,168 1280,142 1460,180" fill="url(#crumbleGradForest)" />
          <polygon points="120,180 260,152 390,180" fill="#174B43" fillOpacity="0.5" />
          <polygon points="560,180 720,148 840,180" fill="#0E2528" fillOpacity="0.6" />
          <polygon points="980,180 1140,150 1260,180" fill="#174B43" fillOpacity="0.4" />
        </g>

        {/* LAYER 2: Staggered Mid-Rise Terraces (Irregular hexagonal & trapezoid facets) */}
        <g opacity="0.8">
          {/* Left Cluster */}
          <polygon points="40,142 95,110 160,122 135,155 55,152" fill="url(#crumbleGradTeal)" />
          <polygon points="180,138 230,105 285,118 270,148 200,150" fill="url(#crumbleGradSage)" />
          <polygon points="310,146 355,120 405,130 380,162 325,158" fill="url(#crumbleGradLime)" />

          {/* Center Cluster */}
          <polygon points="480,132 530,95 610,108 580,144 495,140" fill="url(#crumbleGradTeal)" />
          <polygon points="630,138 685,112 745,125 725,155 640,150" fill="url(#crumbleGradSage)" />
          <polygon points="765,128 820,98 880,114 855,145 780,140" fill="url(#crumbleGradLime)" />

          {/* Right Cluster */}
          <polygon points="920,136 975,108 1040,124 1015,152 935,148" fill="url(#crumbleGradTeal)" />
          <polygon points="1070,142 1125,115 1190,128 1165,158 1085,152" fill="url(#crumbleGradSage)" />
          <polygon points="1220,130 1275,102 1340,116 1320,148 1235,144" fill="url(#crumbleGradLime)" />
          <polygon points="1360,140 1410,118 1455,132 1440,160 1375,155" fill="url(#crumbleGradTeal)" />
        </g>

        {/* LAYER 3: Ascending Floating Shards (Irregular smaller angled fragments) */}
        <g opacity="0.85">
          {/* Dispersed un-gridded shards */}
          <polygon points="75,98 105,74 135,88 115,110 85,104" fill="url(#crumbleGradLime)" />
          <polygon points="215,92 245,68 275,82 255,102 225,98" fill="url(#crumbleGradTeal)" />
          <polygon points="360,105 385,85 415,95 395,118 370,112" fill="url(#crumbleGradSage)" />
          <polygon points="515,82 550,56 585,72 560,98 525,90" fill="url(#crumbleGradLime)" />
          <polygon points="665,96 695,72 730,86 710,110 675,102" fill="url(#crumbleGradTeal)" />
          <polygon points="810,85 845,60 880,74 855,100 820,92" fill="url(#crumbleGradSage)" />
          <polygon points="955,94 990,70 1025,84 1000,108 965,102" fill="url(#crumbleGradLime)" />
          <polygon points="1105,100 1135,78 1170,90 1150,114 1115,106" fill="url(#crumbleGradTeal)" />
          <polygon points="1255,88 1290,62 1325,76 1300,102 1265,96" fill="url(#crumbleGradSage)" />
        </g>

        {/* LAYER 4: High-Altitude Micro-Crystals (Subtle organic particles rising into space) */}
        <g opacity="0.75">
          <polygon points="120,62 138,46 154,58 140,70" fill="#34B9A5" />
          <polygon points="280,54 296,40 310,50 298,62" fill="#C7ED69" />
          <polygon points="430,70 445,56 460,66 448,78" fill="#174B43" />
          <polygon points="590,44 610,28 626,40 610,54" fill="#34B9A5" />
          <polygon points="740,65 756,52 770,62 758,74" fill="#C7ED69" />
          <polygon points="890,48 910,32 926,44 910,58" fill="#34B9A5" />
          <polygon points="1050,62 1066,48 1080,58 1068,70" fill="#C7ED69" />
          <polygon points="1200,50 1218,36 1234,46 1220,60" fill="#174B43" />
          <polygon points="1350,68 1365,54 1380,64 1368,76" fill="#34B9A5" />
        </g>

        {/* LAYER 5: Apex Whispers (Highest sparse fragments) */}
        <g opacity="0.6">
          <polygon points="210,32 222,22 232,30 222,38" fill="#C7ED69" />
          <polygon points="630,18 642,8 654,16 644,24" fill="#34B9A5" />
          <polygon points="940,24 952,14 964,22 954,30" fill="#C7ED69" />
          <polygon points="1270,28 1282,18 1294,26 1284,34" fill="#34B9A5" />
        </g>
      </svg>
    </div>
  )
}

