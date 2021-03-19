import React from 'react';
import { useEffectiveImages } from '../../store/hooks';
import StickyNote from './StickyNote';

const Images: React.FunctionComponent = () => {
  //const images = useEffectiveImages();
  var canv: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
  var ctx = canv.getContext('2d');
  var img = new Image();
  img.addEventListener('load', function() {
      ctx!.drawImage(img, 100,100);
  });
  img.src = 'wbicon.png';
  return (
    <div id="images">
      {img}
    </div>
  );
};

export default Images;
