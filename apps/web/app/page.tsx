import Gradient from '@/components/ui/Gradient';
import LineGrid from '@/components/ui/LineGrid';
import { FaDatabase } from 'react-icons/fa';
import { Button } from 'rizzui';

export default function App() {
    return (
        <div className="w-full h-full">
            <Gradient />
            <LineGrid />
            <div className="w-96 mx-auto flex flex-col justify-center h-screen">
                <div>
                    <FaDatabase
                        color="#6A7280"
                        className="md:text-7xl sm:text-6xl text-5xl mx-auto"
                    />
                    <h1 className="text-center md:text-2xl sm:text-xl text-lg md:mt-3 md:mb-6 sm:my-4 my-3 font-black text-[#6A7280]">
                        LegoDB
                    </h1>
                    <p className="text-center text-[#A7ACB6] md:w-auto w-10/12 mx-auto">
                        simple and go-to backend solution for all of your
                        ship-fast project.
                    </p>
                    <div className="w-full flex flex-row justify-center my-6 space-x-2">
                        <Button className="rounded-full">
                            Create New Project
                        </Button>
                        <Button variant="outline" className="rounded-full">
                            Documentation
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
