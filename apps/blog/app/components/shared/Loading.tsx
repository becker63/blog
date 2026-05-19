import "./shared.css";

export interface LoadingProps {
    fontsize: number;
}

/**
 * Simple loading indicator component.
 */
export function Loading({ fontsize }: LoadingProps) {
    return (
        <div className="loading text-white" style={{ fontSize: fontsize.toString() + "px" }}>
            <h1>...</h1>
        </div>
    );
}
