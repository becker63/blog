import { Loading } from "../components/shared/Loading";

export default function loading() {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Loading fontsize={100} />
    </div>
  );
}
