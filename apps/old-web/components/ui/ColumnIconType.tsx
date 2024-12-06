import { RowPropertyType } from '@prisma/client';
import { MdTextFields } from 'react-icons/md';
import { FaFile } from 'react-icons/fa';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { FaCalendarAlt } from 'react-icons/fa';
import { TbNumbers } from 'react-icons/tb';
import { FaLink } from 'react-icons/fa';
import { BsFileEarmarkRichtextFill } from 'react-icons/bs';
import { RiCheckboxMultipleBlankFill } from 'react-icons/ri';

interface ColumnIconProp {
    type: RowPropertyType;
}

const ColumnIconType = ({ type }: ColumnIconProp) => {
    switch (type) {
        case 'Text':
            return (
                <MdTextFields className="text-[#7D7C77] text-base font-semibold" />
            );
        case 'Attachment':
            return (
                <FaFile className="text-[#7D7C77] text-base font-semibold" />
            );
        case 'Boolean':
            return (
                <IoIosCheckmarkCircle className="text-[#7D7C77] text-base font-semibold" />
            );
        case 'Calendar':
            return (
                <FaCalendarAlt className="text-[#7D7C77] text-base font-semibold" />
            );
        case 'Number':
            return (
                <TbNumbers className="text-[#7D7C77] text-base font-semibold" />
            );
        case 'Relation':
            return (
                <FaLink className="text-[#7D7C77] text-base font-semibold" />
            );
        case 'RichText':
            return (
                <BsFileEarmarkRichtextFill className="text-[#7D7C77] text-base font-semibold" />
            );
        case 'Tags':
            return (
                <RiCheckboxMultipleBlankFill className="text-[#7D7C77] text-base font-semibold" />
            );
    }
};

export default ColumnIconType;
