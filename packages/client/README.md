# Trunkless whiteboard frontend
## DONE
* Free-hand drawing = the Coordinate of every colored pixel of a line is mapped to 1

## TODO
* Protocol client. -> Awaiting protobuf/websocket protocol implementation, 
* Free-hand erasing. -> Add Eraser cursor, implement eventlisteners in Cursor.tsx
* Undo functionality. -> Add user local history for undo
* Inserting images on a whiteboard. -> use <Img> html tag
* Adding and editing sticky notes. -> 
* Host controls for admitting users. 
* Providing user’s name for presenting to the host. 
* Saving whiteboard as PNG.

## Editor.tsx root component
Editor.tsx exports div which contains and renders canvas, cursor selector, images, sticky notes.
