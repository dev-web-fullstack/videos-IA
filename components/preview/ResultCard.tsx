import VideoPlayer from "./VideoPlayer";

type Props = {
  result: any;
};

export default function ResultCard({
  result,
}: Props) {

  if (!result) return null;

  return (

    <section className="space-y-6">

      <div className="flex justify-center">

        <VideoPlayer
          videoPath={result.videoPath}
        />

      </div>

      <details className="bg-gray-900 rounded-lg p-4">

        <summary className="cursor-pointer text-sm text-green-400 font-semibold">

          Informações da geração

        </summary>

        <pre className="mt-4 text-xs overflow-auto whitespace-pre-wrap">

          {JSON.stringify(result, null, 2)}

        </pre>

      </details>

    </section>

  );

}