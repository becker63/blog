import {Loading} from "../../global_components/global_loading"

export default function loading() {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
    <Loading fontsize={100}/>
    </div>
  );
}
