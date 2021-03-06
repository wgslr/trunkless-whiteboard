//import React, { useCallback, useEffect, useRef} from "react";
//import { isContext } from "vm";
//import {Coordinate} from '../types';
import {bitmap} from './whiteboard';

const reset = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0,0,canvas.width,canvas.height);
}

const render = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (ctx == null) {
        throw new Error("no ctx");
    }
    reset(ctx, canvas);

    ctx.fillStyle = "#000000"
    bitmap.forEach(x => {
        x.forEach( (value,key) => {
            if (value != 0) {
                ctx.fillRect(key.x-canvas.offsetLeft, key.y-canvas.offsetTop, 1 , 1);
            }
        })
    });
}
export default render;