import React from 'react';
import { useEffectiveImages } from '../../store/hooks';
import { Img } from '../../types';

const Images: React.FunctionComponent = () => {
  const images = useEffectiveImages();
  const imgList = Array.from(images.values()).map( img => {
    let image = new Image();
    image.src = img.data
    

  })
  return (
    <p>nigas</p>
  );
};

export default Images;
