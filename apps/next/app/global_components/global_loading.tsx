import "./global_components.css"

export function Loading({fontsize}: {fontsize: number}) {
  
    return (
        <div className="loading text-white" style={{fontSize: fontsize.toString() + "px"}}>
          <h1 >....</h1>
        </div>
    );
  }
  