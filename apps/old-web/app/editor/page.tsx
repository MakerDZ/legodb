'use client';
import { Editor } from 'novel-lightweight';
import { useEffect, useState } from 'react';

export default function App() {
    const [data, setData] = useState(
        "hello world\n\n![](https://i.pinimg.com/originals/ba/f3/41/baf341b6b028c1dd2dad1a30262576fe.gif)### how to be cool\n\nhello world is so cool, you should try to code. that's the only way to become very cool as you expected."
    );

    return (
        <Editor
            className="w-full"
            defaultValue={data}
            disableLocalStorage={true}
            onDebouncedUpdate={() => {
                console.log(data);
            }}
            onUpdate={(editor) => {
                setData(editor?.storage.markdown.getMarkdown());
            }}
            handleImageUpload={async (file) => {
                // const uploads = await startUpload([file]);
                // if (uploads && uploads.length > 0) {
                //     return uploads[0].url;
                // }
                return 'https://i.pinimg.com/originals/ba/f3/41/baf341b6b028c1dd2dad1a30262576fe.gif';
            }}
        />
    );
}
