import React, { useCallback, useEffect, useRef} from "react";
import { isContext } from "vm";
import {Coordinate} from '../types';
import {bitmap} from './whiteboard';

const reset = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillRect(0,0,canvas.width,canvas.height);
}

const render = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (ctx == null) {
        throw new Error("no ctx");
    }
    reset(ctx, canvas);

    bitmap.map( (M, i) => {
        M.forEach( (value,key) => {
            // Color erased pixels white based on value?
            ctx.fillRect(key.x, key.y, 1 , 1);
        })
    })
}
export default render;