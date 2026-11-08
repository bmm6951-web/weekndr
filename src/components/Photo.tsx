// A travel photo with a soft color gradient underneath, so the layout
// still looks intentional while the image loads (or if it can't load).

type PhotoProps = {
  src: string;
  alt: string;
  className?: string;
  tone?: "sky" | "navy" | "cream";
};

const tones = {
  sky: "linear-gradient(135deg, #cfdde6 0%, #8fb0c4 100%)",
  navy: "linear-gradient(135deg, #4a5166 0%, #1b2338 100%)",
  cream: "linear-gradient(135deg, #e9dfcf 0%, #d9b9a0 100%)",
};

export default function Photo({ src, alt, className = "", tone = "sky" }: PhotoProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`film bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url("${src}"), ${tones[tone]}` }}
    />
  );
}
