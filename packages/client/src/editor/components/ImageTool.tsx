import React from 'react';
import { Coordinates } from '../../protocol/protocol';
import { UUID, Img } from '../../types';
import ImageIcon from '@material-ui/icons/Image';
import Button from '@material-ui/core/Button';
import { imgState, modeState } from '../state';
import { useRecoilState } from 'recoil';

interface AddImgProps {
    add: (id: UUID, pos: Coordinates, data: string) => void;
}

const ImageTool: React.FunctionComponent = () => {
    const [imgData, setImgData] = useRecoilState(imgState);
    const [mode, setMode] = useRecoilState(modeState);
    
    const onClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMode('image');
        if (event.target.files && event.target.files[0]) {
            let image = event.target.files[0];
            let reader = new FileReader();
            reader.readAsText(image);
            reader.onload = () => {
                setImgData(reader.result as string)
            }
        }
    }   
    
    return(
        <div>
            <input
                type="file"
                accept="image/*" 
                onChange={ e => onClick(e) } 
                id="file-button"
                hidden/>
            <label htmlFor="file-button">
                <Button component="span">
                    <ImageIcon />
                </Button>
            </label>
        </div>
    )
}

export default ImageTool;