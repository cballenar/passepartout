import type { Signal } from "@preact/signals";
import { useState } from "preact/hooks";

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

    const handleFileChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageSrc(event.target?.result as string);
                props.imageSrc.value = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageClick = () => {
        document.getElementById("fieldUpload")?.click();
    };

    return (
        <div className="framer" style={`background-color: ${props.wallColor.value};`}>
            <div className="frame" style={`background-color: ${props.frameColor.value}; padding: ${props.frameWidth.value/10}em;`}>
                <div className="matt" style={`background-color: ${props.mattColor.value}; padding: ${props.mattWidth.value/10}em;`}>
                    <div className="canvas">
                        <img src={imageSrc} style={`width: ${props.pictureWidth.value/10}em; aspect-ratio: ${aspectRatio};`} onClick={handleImageClick} />
                    </div>
                </div>
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
