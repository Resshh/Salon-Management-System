function SkeletonCards({ count = 3, className = "mt-8" }) {

    return (
        <div
            className={`${className} space-y-6`}
            role="status"
            aria-label="Loading"
        >

            {/* Array.from({ length: 3 }) makes a list with 3 empty places to loop over */}

            {Array.from({ length: count }).map((_, index) => (

                <div key={index} className="skeleton-card">
                    <div className="skeleton-line w-1/3" />
                    <div className="skeleton-line mt-4 w-2/3" />
                    <div className="skeleton-line mt-3 w-1/2" />
                </div>

            ))}

        </div>
    );

}

export default SkeletonCards;
