import type { Signal } from "@preact/signals";
import { useState, useRef, useEffect } from "preact/hooks";

interface FrameProps {
  frameWidth: Signal<number>;
  frameColor: Signal<string>;
  mattWidth: Signal<number>;
  mattColor: Signal<string>;
  pictureWidth: Signal<number>;
  imageSrc: Signal<string>;
  aspectRatio: Signal<string>;
  wallColor: Signal<string>;
}

export default function Framer(props: FrameProps) {
    const [imageSrc, setImageSrc] = useState(props.imageSrc.value);
    const [aspectRatio, setAspectRatio] = useState("auto");
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState(props.pictureWidth.value);
    const [imageZoom, setImageZoom] = useState(1);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Track if user has uploaded an image
    const [hasUploaded, setHasUploaded] = useState(false);

    const handleFileChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageSrc(event.target?.result as string);
                props.imageSrc.value = event.target?.result as string;
                setHasUploaded(true); // Mark as uploaded
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageClick = () => {
        document.getElementById("fieldUpload")?.click();
    };

    // --- Rotation improvements ---
    // Limit slider to +/- 45deg RELATIVE to current base rotation
    const [baseRotation, setBaseRotation] = useState(0);
    const [sliderDelta, setSliderDelta] = useState(0);
    const ROTATE_LIMIT = 45;
    // Rotate by +90/-90 buttons
    const rotateBy = (deg: number) => {
        setBaseRotation((prev) => {
            let newBase = prev + deg;
            // Keep in -180..180 for UI sanity
            if (newBase > 180) newBase -= 360;
            if (newBase < -180) newBase += 360;
            return newBase;
        });
        setSliderDelta(0); // Reset slider to 0 after button rotation
    };
    // Slider handler: only affects delta, not base
    const onRotate = (e: InputEvent) => {
        const delta = parseInt((e.target as HTMLInputElement).value);
        setSliderDelta(delta);
    };
    // The actual rotation is base + slider
    useEffect(() => {
        setRotation(baseRotation + sliderDelta);
    }, [baseRotation, sliderDelta]);
    // --- Centering and bounds ---
    // Helper: get rotated bounding box size
    function getRotatedSize(width: number, height: number, angleDeg: number) {
        const angle = Math.abs(angleDeg) * Math.PI / 180;
        const sin = Math.abs(Math.sin(angle));
        const cos = Math.abs(Math.cos(angle));
        return {
            w: width * cos + height * sin,
            h: width * sin + height * cos
        };
    }
    // Clamp so the entire image stays inside the canvas (with rotation)
    function clampPositionFull(x: number, y: number, imgW: number, imgH: number, rot: number, canvasW: number, canvasH: number) {
        const { w: boxW, h: boxH } = getRotatedSize(imgW, imgH, rot);
        // The image is centered at (x, y) relative to canvas center
        const minX = -(boxW/2 - canvasW/2);
        const maxX = (boxW/2 - canvasW/2);
        const minY = -(boxH/2 - canvasH/2);
        const maxY = (boxH/2 - canvasH/2);
        return {
            x: Math.max(Math.min(x, minX), -maxX),
            y: Math.max(Math.min(y, minY), -maxY)
        };
    }
    // --- Canvas size refs ---
    const [canvasSize, setCanvasSize] = useState({ w: 400, h: 400 });
    const canvasRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const update = () => {
            if (canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                setCanvasSize({ w: rect.width, h: rect.height });
            }
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);
    // --- Move handlers (mouse & touch) with bounds ---
    const [moveActive, setMoveActive] = useState(false);
    const [resizeActive, setResizeActive] = useState(false);
    const [moveStart, setMoveStart] = useState({ x: 0, y: 0 });
    const [moveOrigin, setMoveOrigin] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, zoom: 1 });
    // Move start
    const onPointerDown = (e: PointerEvent | TouchEvent) => {
        if (resizeActive) return;
        setMoveActive(true);
        let clientX = 'touches' in e ? e.touches[0].clientX : (e as PointerEvent).clientX;
        let clientY = 'touches' in e ? e.touches[0].clientY : (e as PointerEvent).clientY;
        setMoveStart({ x: clientX, y: clientY });
        setMoveOrigin({ ...position });
        if ('touches' in e) e.preventDefault();
    };
    // Move
    const onPointerMove = (e: PointerEvent | TouchEvent) => {
        if (moveActive) {
            let clientX = 'touches' in e ? e.touches[0].clientX : (e as PointerEvent).clientX;
            let clientY = 'touches' in e ? e.touches[0].clientY : (e as PointerEvent).clientY;
            let dx = clientX - moveStart.x;
            let dy = clientY - moveStart.y;
            // Calculate image size in px
            let emPx = 16; // 1em = 16px (default)
            let imgW = (props.pictureWidth.value / 10) * imageZoom * emPx;
            let imgH = imgW / parseAspectRatio(aspectRatio);
            let { w: canvasW, h: canvasH } = canvasSize;
            let newPos = { x: moveOrigin.x + dx, y: moveOrigin.y + dy };
            let clamped = clampPositionFull(newPos.x, newPos.y, imgW, imgH, rotation, canvasW, canvasH);
            setPosition(clamped);
            if ('touches' in e) e.preventDefault();
        } else if (resizeActive) {
            let clientX = 'touches' in e ? e.touches[0].clientX : (e as PointerEvent).clientX;
            let delta = clientX - resizeStart.x;
            let sensitivity = 0.005;
            let newZoom = Math.max(0.1, Math.min(5, resizeStart.zoom + delta * sensitivity));
            setImageZoom(newZoom);
            // Clamp position after zoom
            let emPx = 16;
            let imgW = (props.pictureWidth.value / 10) * newZoom * emPx;
            let imgH = imgW / parseAspectRatio(aspectRatio);
            let { w: canvasW, h: canvasH } = canvasSize;
            let clamped = clampPositionFull(position.x, position.y, imgW, imgH, rotation, canvasW, canvasH);
            setPosition(clamped);
            if ('touches' in e) e.preventDefault();
        }
    };
    const onPointerUp = () => {
        setMoveActive(false);
        setResizeActive(false);
    };
    // Resize handle
    const onResizeDown = (e: PointerEvent | TouchEvent) => {
        if (moveActive) return;
        setResizeActive(true);
        let clientX = 'touches' in e ? e.touches[0].clientX : (e as PointerEvent).clientX;
        setResizeStart({ x: clientX, zoom: imageZoom });
        if ('touches' in e) e.preventDefault();
    };
    // --- Aspect ratio parser ---
    function parseAspectRatio(ratio: string): number {
        if (ratio === 'auto') return 1.6; // Default fallback
        if (ratio.includes('/')) {
            const [num, denom] = ratio.split('/').map(Number);
            if (!isNaN(num) && !isNaN(denom) && denom !== 0) return num / denom;
        }
        const asNum = Number(ratio);
        if (!isNaN(asNum) && asNum > 0) return asNum;
        return 1.6;
    }
    // --- Render ---
    return (
        <div
            className="framer"
            style={`background-color: ${props.wallColor.value};`}
            ref={containerRef}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onTouchMove={onPointerMove}
            onTouchEnd={onPointerUp}
            onTouchCancel={onPointerUp}
        >
            <div className="frame" style={`background-color: ${props.frameColor.value}; padding: ${props.frameWidth.value/10}em;`}>
                <div className="matt" style={`background-color: ${props.mattColor.value}; padding: ${props.mattWidth.value/10}em;`}>
                    <div className="canvas" ref={canvasRef} style="position:relative; touch-action:none; min-width: 120px; min-height: 120px; overflow:hidden; width: ${(props.pictureWidth.value)}em; height: auto;">
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            style={`width: ${props.pictureWidth.value/10 * imageZoom}em; aspect-ratio: ${aspectRatio}; transform: translate(${position.x}px,${position.y}px) rotate(${rotation}deg); touch-action:none; cursor: ${imageSrc && !imageSrc.endsWith('/shim.gif') ? (moveActive ? 'grabbing' : 'grab') : 'pointer'}; max-width: 100vw; max-height: 60vh; pointer-events: ${imageSrc && !imageSrc.endsWith('/shim.gif') ? 'auto' : 'none'};`}
                            onPointerDown={imageSrc && !imageSrc.endsWith('/shim.gif') ? onPointerDown : undefined}
                            onTouchStart={imageSrc && !imageSrc.endsWith('/shim.gif') ? onPointerDown : undefined}
                            draggable={false}
                            className={!imageSrc || imageSrc.endsWith('/shim.gif') ? 'img-upload-prompt' : ''}
                        />
                        {/* Resize handle (bottom right corner) */}
                        {imageSrc && !imageSrc.endsWith('/shim.gif') && (
                            <div
                                style="position:absolute; right:0; bottom:0; width:32px; height:32px; background:#fff8; border-radius:50%; cursor: nwse-resize; display:flex; align-items:center; justify-content:center; z-index:2; touch-action:none;"
                                onPointerDown={onResizeDown}
                                onTouchStart={onResizeDown}
                            >↔️</div>
                        )}
                    </div>
                </div>
            </div>
            {/* Upload button below the frame */}
            <div style="display: flex; justify-content: center; margin: 1em 0;">
                <button type="button" onClick={handleImageClick}>
                    {(!imageSrc || imageSrc.endsWith('/shim.gif')) ? 'Upload Image' : 'Replace Image'}
                </button>
            </div>
            {/* Rotation slider and buttons */}
            <div style="margin: 1em 0; display: flex; align-items: center; gap: 1em;">
                <label htmlFor="rotateSlider">Rotate</label>
                <input id="rotateSlider" type="range" min={-ROTATE_LIMIT} max={ROTATE_LIMIT} value={sliderDelta} onInput={onRotate} />
                <button type="button" onClick={() => rotateBy(-90)} title="Rotate -90°">⟲ -90°</button>
                <button type="button" onClick={() => rotateBy(90)} title="Rotate +90°">⟳ +90°</button>
                <span>{rotation}°</span>
            </div>
            <form action="post">
                <fieldset>
                    <legend>Frame</legend>
                    <div className="field"><label htmlFor="fieldFrameColor">Color</label>
                        <input list="frameColors" type="color" id="fieldFrameColor" value={props.frameColor} onChange={(e) => props.frameColor.value = e.target?.value } />
                        <datalist id="frameColors">
                            <option value="#8B4513">SaddleBrown</option> {/* Oak */}
                            <option value="#A0522D">Sienna</option> {/* Mahogany */}
                            <option value="#D2691E">Chocolate</option> {/* Walnut */}
                            <option value="#CD853F">Peru</option> {/* Teak */}
                            <option value="#DEB887">BurlyWood</option> {/* Birch */}
                            <option value="#F4A460">SandyBrown</option> {/* Cedar */}
                            <option value="#D2B48C">Tan</option> {/* Pine */}
                            <option value="#BC8F8F">RosyBrown</option> {/* Cherry */}
                            <option value="#8B0000">DarkRed</option> {/* Redwood */}
                            <option value="#A52A2A">Brown</option> {/* Maple */}
                            <option value="#800000">Maroon</option> {/* Rosewood */}
                            <option value="#5F9EA0">CadetBlue</option> {/* Driftwood */}
                            <option value="#654321">DarkBrown</option> {/* Dark Brown */}
                            <option value="#3B3B3B">DarkCharcoal</option> {/* Dark Charcoal */}
                            <option value="#2F4F4F">DarkSlateGray</option> {/* Dark Slate Gray */}
                        </datalist>
                    </div>
                    <div className="field"><label htmlFor="fieldFrame">Width</label>
                        <input id="fieldFrame" type="range" min="10" max="100" step="5" value={props.frameWidth} onChange={(e) => props.frameWidth.value = parseInt(e.target?.value ) } list="frameWidthSteps" />
                        <datalist id="frameWidthSteps">
                            <option value="10" label="10"></option>
                            <option value="20"></option>
                            <option value="30"></option>
                            <option value="40"></option>
                            <option value="50" label="50"></option>
                            <option value="60"></option>
                            <option value="70"></option>
                            <option value="80"></option>
                            <option value="90"></option>
                            <option value="100" label="100"></option>
                        </datalist>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Matt</legend>
                    <div className="field"><label htmlFor="fieldMattColor">Color</label>
                        <input list="mattColors" type="color" id="fieldMattColor" value={props.mattColor} onChange={(e) => props.mattColor.value = e.target?.value } />
                        <datalist id="mattColors">
                            <option value="#FFFFFF">White</option> {/* White */}
                            <option value="#F0EAD6">Eggshell</option> {/* Eggshell */}
                            <option value="#FAF0E6">Linen</option> {/* Linen */}
                            <option value="#F5F5DC">Beige</option> {/* Beige */}
                            <option value="#DCDCDC">Gainsboro</option> {/* Light Gray */}
                            <option value="#A9A9A9">DarkGray</option> {/* Dark Gray */}
                            <option value="#202020">Black</option> {/* Black */}
                            <option value="#FFF8DC">Cornsilk</option> {/* Cornsilk */}
                            <option value="#FFEBCD">BlanchedAlmond</option> {/* Blanched Almond */}
                            <option value="#FFE4C4">Bisque</option> {/* Bisque */}
                            <option value="#FFDAB9">PeachPuff</option> {/* Peach Puff */}
                            <option value="#FFFACD">LemonChiffon</option> {/* Lemon Chiffon */}
                            <option value="#ADD8E6">LightBlue</option> {/* Light Blue */}
                            <option value="#87CEEB">SkyBlue</option> {/* Sky Blue */}
                            <option value="#4682B4">SteelBlue</option> {/* Steel Blue */}
                            <option value="#5F9EA0">CadetBlue</option> {/* Cadet Blue */}
                            <option value="#B0C4DE">LightSteelBlue</option> {/* Light Steel Blue */}
                        </datalist>
                    </div>
                    <div className="field"><label htmlFor="fieldMatt">Width</label>
                        <input id="fieldMatt" type="range" min="0" max="200" step="10" value={props.mattWidth} onChange={(e) => props.mattWidth.value = parseInt(e.target?.value ) } list="mattWidthSteps" />
                        <datalist id="mattWidthSteps">
                            <option value="0" label="0"></option>
                            <option value="20"></option>
                            <option value="40"></option>
                            <option value="60"></option>
                            <option value="80"></option>
                            <option value="100" label="100"></option>
                            <option value="120"></option>
                            <option value="140"></option>
                            <option value="160"></option>
                            <option value="180"></option>
                            <option value="200" label="200"></option>
                        </datalist>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Picture</legend>
                    <div className="field"><label htmlFor="fieldCrop">Crop</label>
                        <select id="fieldCrop" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
                            <option value="auto">Original</option>
                            <option value="1">1:1 (Square)</option>
                            <option value="4/3">4:3 (Standard)</option>
                            <option value="16/9">16:9 (Widescreen)</option>
                            <option value="3/2">3:2 (Classic)</option>
                            <option value="21/9">21:9 (Cinematic)</option>
                            <option value="9/16">9:16 (Vertical)</option>
                            <option value="3/4">3:4 (Vertical)</option>
                            <option value="2/3">2:3 (Vertical)</option>
                            <option value="9/21">9:21 (Vertical)</option>
                        </select>
                    </div>
                    <div className="field"><label htmlFor="fieldPicture">Size</label>
                        <input id="fieldPicture" type="range" min="10" max="500" value={props.pictureWidth} onChange={(e) => props.pictureWidth.value = parseInt(e.target?.value ) } list="pictureWidthSteps" />
                        <datalist id="pictureWidthSteps">
                            <option value="10" label="10"></option>
                            <option value="60"></option>
                            <option value="110"></option>
                            <option value="160"></option>
                            <option value="210"></option>
                            <option value="260"></option>
                            <option value="310"></option>
                            <option value="360"></option>
                            <option value="410"></option>
                            <option value="460"></option>
                            <option value="500" label="500"></option>
                        </datalist>
                    </div>
                    <div className="field"><label htmlFor="fieldUpload">Upload</label>
                        <input id="fieldUpload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Wall</legend>
                    <div className="field"><label htmlFor="fieldWallColor">Color</label>
                        <input list="wallColors" type="color" id="fieldWallColor" value={props.wallColor} onChange={(e) => props.wallColor.value = e.target?.value } />
                        <datalist id="wallColors">
                            <option value="#FFFAF0">FloralWhite</option> {/* Light Pastel */}
                            <option value="#FFF5EE">Seashell</option> {/* Light Pastel */}
                            <option value="#F0FFF0">Honeydew</option> {/* Light Pastel */}
                            <option value="#F5FFFA">MintCream</option> {/* Light Pastel */}
                            <option value="#F0FFFF">Azure</option> {/* Light Pastel */}
                            <option value="#F0F8FF">AliceBlue</option> {/* Light Pastel */}
                            <option value="#E6E6FA">Lavender</option> {/* Light Pastel */}
                            <option value="#FFF0F5">LavenderBlush</option> {/* Light Pastel */}
                            <option value="#FFE4E1">MistyRose</option> {/* Light Pastel */}
                            <option value="#FAEBD7">AntiqueWhite</option> {/* Light Pastel */}
                            <option value="#FAF0E6">Linen</option> {/* Light Pastel */}
                            <option value="#FFFACD">LemonChiffon</option> {/* Light Pastel */}
                            <option value="#FFEFD5">PapayaWhip</option> {/* Light Pastel */}
                            <option value="#FFDAB9">PeachPuff</option> {/* Light Pastel */}
                            <option value="#FFE4B5">Moccasin</option> {/* Light Pastel */}
                            <option value="#FFD700">Gold</option> {/* Vivid */}
                            <option value="#FFA500">Orange</option> {/* Vivid */}
                            <option value="#FF8C00">DarkOrange</option> {/* Vivid */}
                            <option value="#FF6347">Tomato</option> {/* Vivid */}
                            <option value="#FF4500">OrangeRed</option> {/* Vivid */}
                            <option value="#FF0000">Red</option> {/* Vivid */}
                            <option value="#DC143C">Crimson</option> {/* Vivid */}
                            <option value="#B22222">FireBrick</option> {/* Vivid */}
                            <option value="#8B0000">DarkRed</option> {/* Vivid */}
                            <option value="#ADD8E6">LightBlue</option> {/* Light Blue */}
                            <option value="#87CEEB">SkyBlue</option> {/* Sky Blue */}
                            <option value="#4682B4">SteelBlue</option> {/* Steel Blue */}
                            <option value="#5F9EA0">CadetBlue</option> {/* Cadet Blue */}
                            <option value="#B0C4DE">LightSteelBlue</option> {/* Light Steel Blue */}
                            <option value="#AFEEEE">PaleTurquoise</option> {/* Pale Turquoise */}
                            <option value="#E0FFFF">LightCyan</option> {/* Light Cyan */}
                            <option value="#98FB98">PaleGreen</option> {/* Pale Green */}
                            <option value="#90EE90">LightGreen</option> {/* Light Green */}
                            <option value="#D3D3D3">LightGray</option> {/* Light Gray */}
                            <option value="#A9A9A9">DarkGray</option> {/* Dark Gray */}
                            <option value="#696969">DimGray</option> {/* Dim Gray */}
                            <option value="#808080">Gray</option> {/* Gray */}
                            <option value="#2F4F4F">DarkSlateGray</option> {/* Dark Slate Gray */}
                            <option value="#708090">SlateGray</option> {/* Slate Gray */}
                        </datalist>
                    </div>
                </fieldset>
            </form>
        </div>
    )
}
