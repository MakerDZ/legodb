import BounceWrapper from '../../ui/BounceWrapper';
import ProjectLists from './ProjectLists';
import { RiSettings4Fill } from 'react-icons/ri';
import { Tooltip } from 'rizzui';

const SideMenu = () => {
    const projects: any = [];

    return (
        <nav className="min-w-20 bg-[#F9FAFB] border-r-2 border-r-solid border-r-[#E9ECEF] h-screen flex flex-col">
            <BounceWrapper>
                <img
                    className="w-14 h-14 mx-auto my-5 hover:cursor-pointer"
                    src="./logo.png"
                />
            </BounceWrapper>
            <ProjectLists projectLists={projects} />

            <div className="w-full h-auto my-5 flex justify-center items-center">
                <BounceWrapper>
                    <Tooltip placement="left" content={'Settings'}>
                        <div
                            key="last-item"
                            className="w-12 h-12 mx-auto hover:cursor-pointer rounded-full bg-[#E4E7EB] flex flex-col justify-center"
                        >
                            <RiSettings4Fill
                                size={28}
                                color="#6A7280"
                                className="mx-auto"
                            />
                        </div>
                    </Tooltip>
                </BounceWrapper>
            </div>
        </nav>
    );
};

export default SideMenu;
