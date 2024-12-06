import dynamic from 'next/dynamic';
import '@uiw/react-markdown-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MarkdownEditor = dynamic(
    () => import('@uiw/react-markdown-editor').then((mod) => mod.default),
    { ssr: false }
);

const MarkDownEditor = ({
    markDownValue,
    setMarkDownValue,
}: {
    markDownValue: string;
    setMarkDownValue: (value: string) => void;
}) => {
    return (
        <div data-color-mode="light">
            <MarkdownEditor
                //@ts-ignore
                width="1200px"
                height="500px"
                value={markDownValue}
                onChange={(value) => {
                    setMarkDownValue(value);
                }}
            />
        </div>
    );
};

export default MarkDownEditor;
