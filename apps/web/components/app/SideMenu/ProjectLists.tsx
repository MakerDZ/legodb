'use client';

import { useState } from 'react';
import BounceWrapper from '@/components/ui/BounceWrapper';
import ProjectCard from './ProjectCard';
import { FiPlus } from 'react-icons/fi';
import { Tooltip } from 'rizzui';

const ProjectLists = ({ projectLists }: { projectLists: Project[] | [] }) => {
    const [selectedProject, setSelectedProject] = useState<Project | null>(
        null
    );

    return (
        <div
            key="project-lists"
            className="scrollable-list flex-1 overflow-y-auto space-y-7 py-3"
        >
            {projectLists.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    isSelected={selectedProject?.id === project.id}
                    onClick={() => setSelectedProject(project)}
                />
            ))}
            <BounceWrapper>
                <Tooltip placement="left" content={'Create New Project'}>
                    <div
                        key="last-item"
                        className="w-12 h-12 mx-auto hover:cursor-pointer rounded-full bg-[#E4E7EB] flex flex-col justify-center"
                    >
                        <FiPlus size={28} color="#6A7280" className="mx-auto" />
                    </div>
                </Tooltip>
            </BounceWrapper>
        </div>
    );
};

export default ProjectLists;
