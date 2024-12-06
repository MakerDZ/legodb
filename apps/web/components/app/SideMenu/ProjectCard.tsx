import BounceWrapper from '@/components/ui/BounceWrapper';
import { Tooltip } from 'rizzui';

const ProjectCard = ({
    project,
    isSelected,
    onClick,
}: {
    project: Project;
    isSelected: boolean;
    onClick: () => void;
}) => {
    return (
        <div key={project.id} className="relative" onClick={onClick}>
            {isSelected && (
                <div className="absolute left-0 top-0 w-[5.5px] h-full flex flex-col justify-center">
                    <div className="w-full h-10 bg-[#0A99FE] rounded-r-xl animate-expandLine"></div>
                </div>
            )}
            <BounceWrapper>
                <Tooltip placement="left" content={project.name}>
                    <img
                        src="https://static.vecteezy.com/system/resources/previews/021/608/790/non_2x/chatgpt-logo-chat-gpt-icon-on-black-background-free-vector.jpg"
                        key={`img-${project.id}`}
                        className="w-12 h-12 mx-auto hover:cursor-pointer rounded-md border-1 border-[#E9ECEF]"
                    />
                </Tooltip>
            </BounceWrapper>
        </div>
    );
};

export default ProjectCard;
