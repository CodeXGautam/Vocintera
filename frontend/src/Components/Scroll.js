import InfiniteScroll from "./InfiniteScroll";

export default function Scroll() {

    const items = [
        { content: <p className="font-bold">Software Development</p> },
        { content: <p className="font-bold">Product Management</p> },
        { content: <p className="font-bold">Data Analyst</p> },
        { content: <p className="font-bold">Consulting Roles</p> },
        { content: <p className="font-bold">Machine Learning</p> },
    ];


    return (
        <div style={{ height: '500px', position: 'relative' }} className="flex justify-center items-center">
            <InfiniteScroll
                items={items}
                isTilted={true}
                tiltDirection='left'
                autoplay={true}
                autoplaySpeed={1.38}
                autoplayDirection="up"
                pauseOnHover={true}
            />
        </div>
    );
}