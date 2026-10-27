// A travel photo with a soft color gradient underneath, so the layout
// still looks intentional while the image loads (or if it can't load).

type PhotoProps = {
  src: string;
  alt: string;
  className?: string;
  tone?: "sky" | "navy" | "cream";
};

const tones = {
  sky: "linear-gradient(135deg, #cfe0ec 0%, #9dbcd4 100%)",
  navy: "linear-gradient(135deg, #2c3b5c 0%, #16233f 100%)",
  cream: "linear-gradient(135deg, #efe6d6 0%, #cfe0ec 100%)",
};

export default function Photo({ src, alt, className = "", tone = "sky" }: PhotoProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url("${src}"), ${tones[tone]}` }}
    />
  );
}
