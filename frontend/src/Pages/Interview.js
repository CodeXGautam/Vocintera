import Footer from "../Components/Footer";
import Sidebar from "../Components/Sidebar";


const Interview = () => {
    return (
        <div className="flex w-[100%] relative gap-4 overflow-hidden">
            <Sidebar />

            <div className="w-[100%] max-h-screen bg-slate-900 flex flex-col gap-8 transition-all
            duration-300 ease-in-out rounded-md shadow-md shadow-blue-500 p-5 overflow-y-scroll">

                <div className="flex min-h-screen justify-center items-center text-lg text-slate-300 font-semibold">
                    You have no interviews scheduled currently
                </div>

                <Footer />
            </div>

        </div>
    )
}

export default Interview;