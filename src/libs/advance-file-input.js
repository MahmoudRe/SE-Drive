import Sortable, { AutoScroll } from 'sortablejs/modular/sortable.core.esm.js';

Sortable.mount(new AutoScroll());	//mount AutoScroll plug-in

/**
 * Advance file input that support drag & drop, multiple files, image preview and custom style.
 */
export default class AdvanceFileInput {


    /**
     * Initialize a new instance of AdvanceFileInput.
     * 
     * To use this module:
     * 1. Initialize a new instance given the selector of the input file.
     * 2. Make sure the advance-file-input.scss style sheet are set and works probably.
     * 3. In case the input field accept multiple files, use `invokeData(formData)` method on submit event listener and send the modified formData instance using fetch API or Ajax, as the default submit-action won't include the multiple file in order.
     * 4. In case of edit-form and `withPreview` set to true, add the exited images as `<img>` tags directly in the same container that has the `<input>` tag, hence this will render them as preview cards inside the preview container.
     * 
     * @constructor
     * @param {Object} config
     * @param {String} config.selector Input file selector
     * @param {String} config.externalPreviewWrapper (optional) External image preview wrapper (only for single-file input, ie. input.multiple == false).
     * @param {false} config.withPreview (optional) Show the built-in images preview (only for multiple-files input, ie. input.multiple == true).
     * @param {false} config.withAnimation (optional) Turn on/off all animations.
     * @param {[3e+6]} config.maxFileSize (optional) Maximum file size in bytes.
     * @param {(img:HTMLElement) => {}} config.beforeLoadingPreview (optional) Callback injected BEFORE loading the image preview into the external wrapper or the preview conatiner,
     *                                                                          the function is loaded as Promise function to block appending the image into the DOM untill this function is resolved, 
     *                                                                          the created image element is passed as the first argument (to be used only with 'externalPreviewWrapper' or 'withPreview' option).
     * @param {(files:FileList) => true|false} config.beforeFileAdded (optional) Callback that called when a new file(s) has been dropped/added, but before adding to dom.
     *                                                                            The returns (true) or (false) determine whether to proceed or not.
     * @param {(files:FileList) => {}} config.onFileAdded (optional) async Callback that called when a new file(s) has been dropped/added, with FileList obj as the first argument.
     * @param {(files:FileList) => {}} config.onFileRemoved (optional) Callback that called when a new file(s) has been removed, with removed file as the first argument.
     */
    constructor(config = {}) {
        let { 
            selector,
            externalPreviewWrapper = '',    //external image preview wrapper (only when input accepts one file)
            withPreview = false,            //show the built-in image preview
            withAnimation = true,           //show in/out-animation for file-card
            withLabel = true,
            withKeywordsField = false,
            maxFileSize = 3e+6,             //size in bytes
            dragText = 'Drag your file here',
            beforeLoadingPreview = () => {},
            beforeFileAdded = async () => true,
            onFileAdded = () => {},
            onFileRemoved = () => {},
        } = config;

        let droppedFilesMap = new Map();   //in case of multiple-files
        this.droppedFilesMap = droppedFilesMap;

        // ----------- [ Layout ] ----------- //

        let input = document.querySelector(selector);
        input.style.display = 'none';
        this.input = input;

        let parentNode = input.parentNode;

        let containerDiv = document.createElement('div');
        containerDiv.classList.add('advance-file-input');
        parentNode.appendChild(containerDiv);

        let label = parentNode.querySelector('label');
        if(!label) {
            label = document.createElement('label');
            label.setAttribute('for', input.id);
            label.textContent = input.id;
        }
        containerDiv.appendChild(label);

        let errorDiv = parentNode.querySelector('div.error');
        if(!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.classList.add('error');
            errorDiv.classList.add('hide');
        }
        errorDiv.style.display = "none";
        errorDiv.style['grid-template-columns'] = 'minmax(100%, min-content)';
        parentNode.appendChild(errorDiv);

        let helpText = parentNode.querySelector('p.help-text');
        if(!helpText) {
            helpText = document.createElement('p');
            helpText.classList.add('help-text');
            helpText.id = input.id + "_help";
        }
        parentNode.appendChild(helpText);

        let labelText = label.textContent;
        label.textContent = '';

        if (withLabel) {
            let newLabel = document.createElement('label');
            newLabel.textContent = labelText;
            parentNode.insertBefore(newLabel, containerDiv);
        }

        label.appendChild(input);

        let cloudIcon = parseElement(`
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  id="cloud-upload-icon" width="70" viewBox="-10 -90 520 620" fill="var(--color-primary)" stroke="var(--color-primary)" stroke-width="10px" stroke-linejoin="round">
                <path d="M483.6,295.2l-69.5-107.4c-5.4-8.3-14.5-13.3-24.4-13.3H359c-4.5,0-7.2,5-4.7,8.7l75,116c1,1.5-0.1,3.5-1.9,3.5h-32.9    h-26.8H342c-3.1,0-5.5,2.5-5.7,5.5c-2.9,48.4-43,86.8-92.2,86.8s-89.3-38.4-92.2-86.8c-0.2-3.1-2.6-5.5-5.7-5.5h-25.7h-23H60.9    c-1.8,0-2.8-2-1.9-3.5l75-116c2.4-3.8-0.3-8.7-4.7-8.7H98.6c-9.9,0-19,5-24.4,13.3L4.8,295.2C1.7,300,0,305.7,0,311.5v149.6    c0,14.6,11.9,26.5,26.5,26.5h217.7h217.7c14.6,0,26.5-11.9,26.5-26.5V311.5C488.4,305.7,486.8,300.1,483.6,295.2z"/>
                <path id="cloud-upload-icon__arrow" style="transform: translate(-15px, 0px)" d="m265.84098,17.41788c-4.1,-5.2 -12,-5.2 -16.1,0l-65.9,83.8c-5.3,6.7 -0.5,16.6 8,16.6l40.35886,0l0,155.2231c0,22.1 3.54114,43.0769 25.64114,43.0769l0,0c22.1,0 25.64114,-23.02817 25.64114,-45.12817l1.53845,-154.29747l38.82041,1.02563c8.5,0 13.3,-9.9 8,-16.6l-66,-83.7z" />
            </svg>
        `);
        label.appendChild(cloudIcon);
        let cloudIconArrow = cloudIcon.querySelector('#cloud-upload-icon__arrow');
        if (withAnimation) cloudIcon.classList.add('--animate');
        if (!input.multiple) Object.assign(cloudIcon.style, { height: '35px', transform: 'scale(1.1)' });

        let dragTextEl = parseElement(`<p> ${dragText} or <a> browse </a> </p>`);
        label.appendChild(dragTextEl);


        let filesContainer = document.createElement('div');
        containerDiv.insertBefore(filesContainer, label);
        let arrowRightIcon = null;
        let arrowLeftIcon = null;
        let filesContainerLabel = null;
        if (withPreview) {
            filesContainer.classList.add('preview-container');
            containerDiv.classList.add('--has-preview-container');

            arrowRightIcon = parseElement(`
                <svg class="preview-container__arrow --right" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <circle fill="#16837C" cx="12" cy="12" r="12"></circle>
                    <polygon fill="#FFF" transform="rotate(-90) translate(-25, 1)" points="18.6294555 8 20 9.39308733 13.5 16 7 9.39308733 8.37054448 8 13.5 13.2138253"></polygon>
                </svg>
            `);
            arrowRightIcon.addEventListener('click', () => { filesContainer.scrollBy({ left: 125, behavior: 'smooth' }); })
            containerDiv.insertBefore(arrowRightIcon, filesContainer);

            arrowLeftIcon = parseElement(`
                <svg class="preview-container__arrow --left" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <circle fill="#16837C" cx="12" cy="12" r="12"></circle>
                    <polygon fill="#FFF" transform="rotate(90) translate(-1.5, -23)" points="18.6294555 8 20 9.39308733 13.5 16 7 9.39308733 8.37054448 8 13.5 13.2138253"></polygon>
                </svg>
            `);
            arrowLeftIcon.addEventListener('click', () => { filesContainer.scrollBy({ left: -125, behavior: 'smooth' }); })
            containerDiv.insertBefore(arrowLeftIcon, filesContainer);

            filesContainer.addEventListener('scroll', () => { handleOverflowX(filesContainer) });

            //add existing images, in case of edit-form
            parentNode.querySelectorAll('img').forEach((img) => {
                addPreviewCard({
                    id: img.dataset.id,
                    src: img.src,
                    name: img.alt,
                })
                img.remove();
            });

            
            // In case the added images overflows the container, 
            // we can't detect it until it is visible on viewport (otherwise all dimensions is 0).
            // so make observer to make an extra check for overflowing when it gets visible (for the first time).
            let observer = new IntersectionObserver(observeCallback);
            observer.observe(filesContainer);

            function observeCallback() {
                handleOverflowX(filesContainer);
   
                //when clientWidth > 0, then the element is rendered on viewport.
                if (filesContainer.clientWidth > 0)
                    observer.unobserve(filesContainer);
            }
        } 
        else {
            filesContainer.classList.add('files-container');

            if(withKeywordsField) {
                filesContainerLabel = parseElement(`
                <div class="files-container__label">
                    <label> Files: </label>
                    <label> Keywords: </label>
                </div>`)
                containerDiv.insertBefore(filesContainerLabel, filesContainer)
            }
        }


        // ------------ [ Prepare ] ------------ //

        externalPreviewWrapper = externalPreviewWrapper ? document.querySelector(externalPreviewWrapper) : null;
        let previousImgHTML = externalPreviewWrapper 
            && externalPreviewWrapper.innerHTML
            || null;
        input.style.display = 'none';

        let acceptTypesArr = input.accept
            .split(/, |,| /)
            .map(e=>{ 
                e = e.split('/');
                if(e.length == 2 && e[1] == '*')    //if type like: "image/*"
                    return e[0]
                else if (e.length == 2)             //if type like: "image/png"
                    return e[1]
                else                                //if type like: ".png"
                    return e[0].charAt(0) == '.' ? e[0].substring(1) : e[0]
            });

        this.sortable = null;
        if (input.multiple)
            this.sortable = Sortable.create(filesContainer, {
                animation: 150,
                draggable: '.preview-card, .afi__file-card-wrapper, .afi__file-card',
                onStart: () => {
                    containerDiv.classList.add('--dragover-sortable');
                },
                onEnd: () => {
                    containerDiv.classList.remove('--dragover-sortable');
                }
            });


        // ----------- [ Functionality ] ----------- //

        let dragCounter = 0;        //fix flickering issue

        ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
            containerDiv.addEventListener(eventName, (e) => {				
                    //if an element from SortableJS is moved, skip this event
                    if (e.dataTransfer.effectAllowed == "move" ||
                        e.dataTransfer.effectAllowed == "copyMove") 
                            return;

                    e.preventDefault();
                    e.stopPropagation();
                })
        })

        containerDiv.addEventListener('dragenter', (e) => {
            //if an element from SortableJS is moved, skip this event
            if (e.dataTransfer.effectAllowed == "move" ||
                e.dataTransfer.effectAllowed == "copyMove") 
                    return;

            dragCounter++;
            containerDiv.classList.add('--dragover');
        });

        containerDiv.addEventListener('dragleave', (e) => {				
            //if an element from SortableJS is moved, skip this event
            if (e.dataTransfer.effectAllowed == "move" ||
                e.dataTransfer.effectAllowed == "copyMove") 
                    return;

            dragCounter--;
            if (dragCounter === 0) 
                containerDiv.classList.remove('--dragover');
        });
    
        containerDiv.addEventListener('drop', (e) => {
            //if an element from SortableJS is moved, skip this event		
            if (e.dataTransfer.effectAllowed == "move" ||
                e.dataTransfer.effectAllowed == "copyMove") 
                    return;

            dragCounter = 0;
            containerDiv.classList.remove('--dragover');
            addFiles(e.dataTransfer.files);
        });

        input.addEventListener('change', (e) => {
            addFiles(e.target.files);
        });

        async function addFiles(newFiles) {

            if(!(await beforeFileAdded(newFiles))) return;
            
            //hide error msg
            errorDiv.classList.add('hide');
            errorDiv.style.display = 'none';

            let cloudIconArrowAnimation = null;
            if(withAnimation && filesContainer.children.length == 0)
                cloudIconArrowAnimation = cloudIconArrow.animate(
                    { transform: 'translate(-15px, -800px)' },
                    { duration: 200, ease: 'ease-out' }
                )

            if (input.multiple) {

                let counter = 0;
                for(const file of newFiles) {
                    if(!validateFile(file)) continue;
        
                    //validate file name (duplicates)
                    let hasValidName = true;
                    for (let [key, val] of droppedFilesMap.entries())
                        if(file.name == val.name)
                            hasValidName = false; 	//duplicate file!
        
                    if(!hasValidName) {
                        showErrorMsg(`A file with the same name is already added: "${file.name}"`);
                        continue;
                    }
        
                    //make unique key (use counter in case multiple files are submitted at the same time)
                    let key = counter + "-" + (new Date()).getTime();
                    droppedFilesMap.set(key, file);

                    if(withPreview) {
                        const animationDelay = counter * 50;
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            if (cloudIconArrowAnimation) setTimeout(addCard, 200);
                            else addCard();
                            
                            function addCard() {
                                addPreviewCard({
                                    id: key,
                                    src: e.target.result,
                                    name: file.name,
                                    animationDelay
                                });
                            }
                        }
                        reader.readAsDataURL(file); // convert to base64 string
                    } else {
                        const animationDelay = counter * 100;
                        
                        if (cloudIconArrowAnimation) setTimeout(addCard, 200);
                        else addCard();
                        
                        function addCard() {
                            addFileCard({
                                id: key,
                                name: file.name,
                                type: file.type,
                                status: bytesToString(file.size),
                                animationDelay
                            });
                        }
                    }

                    counter++;
                }
            
            } else {    //in case input accepts only one file
                //validate number of dropped files
                if(newFiles.length != 1) {
                    showErrorMsg(newFiles.length + ' files have been dropped. Please select only one file!');
                    return;
                }

                /** 
                 * Firefox bug: newFiles[0] doesn't exists when calling it through `animation.onfinish` or `setTimeout()`, however it works fine when adding file through drag-drop.
                 * 
                 * Apparently the garbage collector delete the contents of newFiles array too soon through setting newFiles.length to 0, such that the array 
                 *   is reused for input element to be ready to take a new file. Remember, the argument `newFiles` is `e.target.files`, ie. the `files` attribute of the input element.
                 *   In drag-drop situation, the newFiles is pointer to `event.dataTransfer.files`, which doesn't need to be emptied quickly.
                 * 
                 * Here when using newFiles variable within the callback `animation.onfinish`, the pointer to `input.files` array is still existed, 
                 *   but its length now is 0 and the File is not accessible through the newFiles (input.files) array.
                 * 
                 * Note: Firefox is certainly not assigning new array to input.files after using it, but it set the length of the existed array to 0. Otherwise, we would 
                 *   get `undefined` for the newFiles variable within addCard() function (in case of scoping issue), or the array content would be still accessible.
                 *   See, https://davidwalsh.name/empty-array
                 * 
                 * To fix this, simple save the pointer to the File object on the spot, so it can be accessible later and the garbage collector won't delete it.
                 */
                const newFile = newFiles[0];

                if(!validateFile(newFile)) return;

                if (cloudIconArrowAnimation) cloudIconArrowAnimation.onfinish = addCard;
                else addCard();

                function addCard() {
                    const animate = filesContainer.children.length ? false : withAnimation;
                    filesContainer.innerHTML = "";
                    addFileCard({
                        name: newFile.name,
                        type: newFile.type,
                        status: bytesToString(newFile.size),
                        onRemove: (file) => {
                            input.value = "";
                            dragTextEl.style.display = 'block';
                            if (externalPreviewWrapper) externalPreviewWrapper.innerHTML = previousImgHTML || "";
                            onFileRemoved(file)
                        },
                        animate
                    });
                    dragTextEl.style.display = 'none';
                }

                //show preview img
                if (externalPreviewWrapper) {
                    const imgPreviewReader = new FileReader();
                    imgPreviewReader.onload = (e) => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        Promise.resolve(img)
                            .then(beforeLoadingPreview)
                            .then(() => {
                                externalPreviewWrapper.innerHTML = '';
                                externalPreviewWrapper.appendChild(img);
                            })
                    }
                    imgPreviewReader.readAsDataURL(newFile); // convert to base64 string
                }
                
                input.files = newFiles;
            }

            onFileAdded(newFiles);
        };

        function validateFile(file) {
            if(!file.type.match(acceptTypesArr.join('|'))) {
                showErrorMsg(`"${file.name}" isn't a valid file! The accepted file types: ${acceptTypesArr.join(', ')}.`);
                return false;
            }

            if(file.size > maxFileSize) {
                showErrorMsg(`The file size is too large: ${bytesToString(file.size)}! Please upload a file that is under ${bytesToString(maxFileSize)}.
                              ${input.multiple? '<br/> File name: ' + file.name : '' }`);
                return false;
            }
            
            return true;
        }

        function showErrorMsg(msg) {
            errorDiv.classList.remove('hide');
            errorDiv.style.display = 'grid';
            errorDiv.innerHTML = msg;
        }

        function parseElement(str) {
            let parser = new DOMParser();
            let doc = parser.parseFromString(str, 'text/html');
            return doc.body.firstChild;
        }

        /**
         * Get the direction of overflow on x-axis. If the element isn't overflown return empty string.
         * @param {HTMLElement} element
         * @returns String: "" => not overflown, "left-right" => overflown in both direction, "left" or "right"
         */
        function getOverflowX(e) {
            if(e.scrollWidth <= e.clientWidth)
                return ""; //not overflown

            if(e.scrollLeft != 0 && e.clientWidth + e.scrollLeft != e.scrollWidth)
                return "left-right";

            if(e.scrollLeft == 0)
                return "right";

            if(e.scrollLeft + e.clientWidth == e.scrollWidth)
                return "left";

            throw new Error("Issue occurred when calculating overflow direction");   //it should be one of the above cases!
        }

        function handleOverflowX(e) {
            let overflowDirection = getOverflowX(e);
            if(overflowDirection) {
                containerDiv.classList.add('--overflown-x');
                arrowLeftIcon.style.display = overflowDirection.includes('left')? 'block' : 'none';
                arrowRightIcon.style.display = overflowDirection.includes('right') ? 'block' : 'none';
            } else {
                containerDiv.classList.remove('--overflown-x');
                arrowLeftIcon.style.display = 'none';
                arrowRightIcon.style.display = 'none';
            }
        }

        function addFileCard({id, name, type, status, animationDelay = 0, onRemove = () => {}, animate = withAnimation}) {
            let elementText =
                `<div class="afi__file-card" data-id="${id}"> 
                    <div class="afi__file-card__icon">
                        ${ getFileIcon(type) }
                    </div>
                    <div>
                        <p class="afi__file-card__name">${name}</p>
                        <p class="afi__file-card__status">${status}</p>
                    </div>
                    <div class="afi__file-card__remove advance-file-input__remove-btn">
                        <svg width="20px" height="22px" viewBox="0 0 20 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <title>Remove file</title>
                            <g id="Icon/Trash" fill="none" transform="translate(1, 1)" stroke="#fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
                                <polyline points="0 4 2 4 18 4"></polyline>
                                <path d="M16,4 L16,18 C16,19.1045695 15.1045695,20 14,20 L4,20 C2.8954305,20 2,19.1045695 2,18 L2,4 M5,4 L5,2 C5,0.8954305 5.8954305,0 7,0 L11,0 C12.1045695,0 13,0.8954305 13,2 L13,4" id="Shape"></path>
                            </g>
                        </svg>
                    </div>
                 </div>`

            if(withKeywordsField)
                elementText = `
                <div class="afi__file-card-wrapper" data-id="${id}"> 
                    ${elementText} 
                    <textarea class="keywords" placeholder="Type some keywords for this file, separated by comma..">${ name.replace(/^\r*\n*|[ ]*/, '').replace(/\.[A-Za-z]{1,5}/, '').replace(/[ ]|\-/, ', ') }</textarea>
                </div>`

            const fileCard = parseElement(elementText)

            if(withKeywordsField && filesContainer.children.length == 0)
                filesContainerLabel.style.display = 'grid';
            
            fileCard.querySelector('.afi__file-card__remove').addEventListener('click', (e) => {
                const removedFile = droppedFilesMap.get(id);
                droppedFilesMap.delete(id);
                errorDiv.classList.add('hide');
                errorDiv.style.display = 'none';

                if(withAnimation) {
                    fileCard
                        .animate(
                            { height: '0' },
                            { duration: 200, easing: 'ease-in-out' }
                        )
                        .onfinish = removeCard;
                } else {
                    removeCard();
                }

                function removeCard() {
                    if(withKeywordsField && filesContainer.children.length == 1)
                        filesContainerLabel.style.display = 'none';
                    
                    fileCard.remove();
                    onRemove(removedFile);
                }
            });

            filesContainer.append(fileCard);

            if(withAnimation && animate) 
                fileCard.animate(
                    { height: '0', offset: 0 },
                    { duration: 200, easing: 'ease-in-out', delay: animationDelay, fill: 'backwards' }
                );
        }

        function addPreviewCard({id, src, name, animationDelay = 0}) {
            const previewCard = parseElement(
                `<div class="preview-card" data-id="${id}"> 
                    <div class="preview-card__remove advance-file-input__remove-btn">
                        <svg width="20px" height="22px" viewBox="0 0 20 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <title>Remove file</title>
                            <g id="Icon/Trash" fill="none" transform="translate(1, 1)" stroke="#fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
                                <polyline points="0 4 2 4 18 4"></polyline>
                                <path d="M16,4 L16,18 C16,19.1045695 15.1045695,20 14,20 L4,20 C2.8954305,20 2,19.1045695 2,18 L2,4 M5,4 L5,2 C5,0.8954305 5.8954305,0 7,0 L11,0 C12.1045695,0 13,0.8954305 13,2 L13,4" id="Shape"></path>
                            </g>
                        </svg>
                    </div>
                    <span class="preview-card__tooltip">${name}</span>
                    <img src="${src}"/>
                 </div>`
            );

            previewCard.querySelector('.preview-card__remove').addEventListener('click', (e) => {
                droppedFilesMap.delete(id);
                errorDiv.classList.add('hide');
                errorDiv.style.display = 'none';

                if(withAnimation) {
                    //animation helper
                    let numLeftCards = filesContainer.children.length - [ ...filesContainer.children].indexOf(previewCard);
                    let bounceForce = Math.min(1 + numLeftCards / 3, 2.75);
                    filesContainer.classList.add('--no-tooltip');   // prevent flickering while card is removed

                    previewCard.style['transform-origin'] = 'top right';
                    previewCard
                        .animate(
                            { transform: 'rotate(-10deg)' },
                            { duration: 100, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' }
                        )
                    previewCard
                        .animate(
                            { transform: 'translateY(110px) rotate(-3deg)' },
                            { duration: 250, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' }
                        )
                    previewCard
                        .animate(
                            { width: '0rem' },
                            { duration: 150, easing: 'cubic-bezier(.7,0,1,1)', fill: 'forwards', delay: 200 }
                        )
                    previewCard
                        .animate(
                            { margin: '0px' },
                            { duration: 100, easing: `cubic-bezier(.19, .41, .25, ${bounceForce})`, delay: 350 }
                        )
                        .onfinish = removeCard;
                } else {
                    removeCard();
                }

                function removeCard() {
                    previewCard.remove();
                    handleOverflowX(filesContainer);
                    setTimeout(() => filesContainer.classList.remove('--no-tooltip'), 500);
                }
            });

            let nameTooltip = previewCard.querySelector('.preview-card__tooltip');
            previewCard.onmousemove = (e) => {
                nameTooltip.style.top = (e.clientY + 10) + 'px';
                nameTooltip.style.left = (e.clientX + 10) + 'px';
            }

            Promise.resolve(previewCard.querySelector('img'))
                .then(beforeLoadingPreview)
                .then(() => {
                    filesContainer.append(previewCard);

                    if(withAnimation) 
                        previewCard.animate(
                            { transform: 'scale(.7) rotate(6deg)', opacity: '0', offset: 0 },
                            { duration: 150, easing: 'cubic-bezier(0.27, 0.57, 1, 1.46)', delay: animationDelay, fill: 'backwards' }
                        );
        
                    handleOverflowX(filesContainer);
                })
        }
    }

    /**
     * In case of multiple files, a custom submit need to be made with modified FormData object.
     * This function invoke the data of this input instance to a given formData en return it.
     * Note: no need to use this method in case of one file input (multiple = false).
     *  
     * @param {FormData} formData object to invoke the files in order (sorted)
     * @returns modified FormData object
     */
    invokeData(formData) { 
        if(!this.input.multiple)
            return formData;

        formData.delete(this.input.name);

        let inputName = this.input.name.slice(-2) == "[]" ? this.input.name.slice(0, -2) : this.input.name;

		// add files to formData, preserve order as in preview
		let i = 0;
		for(let key of this.sortable.toArray()) {
			if (this.droppedFilesMap.has(key)) {
				let file = this.droppedFilesMap.get(key);
				formData.append(`${inputName}[${i}]`, file);
			}
			else {
				formData.append(`${inputName}[${i}]`, key);
			}
			i++;
		}

        return formData; 
    } 

    getData() { 
        let res = [];
		// add files to formData, preserve order as in preview
		for(let key of this.sortable.toArray()) {
            const keywords = document.querySelector(`[data-id="${key}"] textarea`).value;
			if (this.droppedFilesMap.has(key)) {
				let file = this.droppedFilesMap.get(key);
				res.push({file, keywords});
			}
			else {
				res.push({file: key, keywords})
			}
		}

        return res; 
    } 

    removeAll() { 
		// add files to formData, preserve order as in preview
		for(let key of this.sortable.toArray()) {
            this.droppedFilesMap.delete(key)
            document.querySelector(`[data-id="${key}"] .advance-file-input__remove-btn`)?.click()
		}
    } 
}


// ------------- [ Util functions ] ------------- //

export function bytesToString(bytes) {
    if (bytes > 1000000000) return (Math.round(bytes/100000000)/10 + 'GB')
    else if (bytes > 1000000) return (Math.round(bytes/100000)/10 + 'MB')
    else if (bytes > 1000) return (Math.round(bytes/1000) + 'KB')
    else return (bytes + 'B');
}

export function getFileIcon(type) {
    if(type.includes('image'))
        return `
            <svg xmlns="http://www.w3.org/2000/svg" height="32px" width="32px" viewBox="0 0 36 36">
                <g transform="translate(-6, -6)"> 
                    <radialGradient id="nw2JPvgEzDKQpjWgMaZM5a" cx="48.477" cy="36.475" r="22.942" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#bd8af5"/><stop offset=".137" stop-color="#b88bf5"/><stop offset=".309" stop-color="#a88ff3"/><stop offset=".499" stop-color="#8f96f2"/><stop offset=".702" stop-color="#6b9eef"/><stop offset=".913" stop-color="#3eaaec"/><stop offset="1" stop-color="#29afea"/></radialGradient><path fill="url(#nw2JPvgEzDKQpjWgMaZM5a)" d="M40,6H8C6.895,6,6,6.895,6,8v32c0,1.105,0.895,2,2,2h32c1.105,0,2-0.895,2-2V8 C42,6.895,41.105,6,40,6z"/><path fill="#436dcd" d="M32.065,23.065c-1.149-1.149-3.005-1.174-4.185-0.057L18,32.368V42h22c1.105,0,2-0.895,2-2v-7 L32.065,23.065z"/><circle cx="30.5" cy="14.5" r="3.5" fill="#fff"/><linearGradient id="nw2JPvgEzDKQpjWgMaZM5b" x1="23.91" x2="23.91" y1="18.133" y2="42.415" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#124787"/><stop offset=".923" stop-color="#173b75"/><stop offset="1" stop-color="#173a73"/></linearGradient><path fill="url(#nw2JPvgEzDKQpjWgMaZM5b)" d="M8,42h32c0.811,0,1.507-0.485,1.82-1.18L20.065,19.065c-1.149-1.149-3.005-1.174-4.185-0.057 L6,28.368V40C6,41.105,6.895,42,8,42z"/>
                </g>
            </svg>`;

    if(type.includes('pdf'))
        return `
            <svg width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <path fill="#FA0F00" d="M5.65714286,0 L26.3428571,0 C29.4857143,0 32,2.60740741 32,5.86666667 L32,26.1333333 C32,29.3925926 29.4857143,32 26.3428571,32 L5.65714286,32 C2.51428571,32 0,29.3925926 0,26.1333333 L0,5.86666667 C0,2.60740741 2.51428571,0 5.65714286,0 Z"></path>
                <path  fill="#FFF" transform="translate(6.250957, 6.328889)" d="M19.4633286,12.0604444 C17.9776143,10.5244444 13.9204714,11.1502222 12.9490429,11.264 C11.5204714,9.89866667 10.5490429,8.24888889 10.2061857,7.68 C10.7204714,6.144 11.0633286,4.608 11.1204714,2.95822222 C11.1204714,1.536 10.5490429,0 8.94904286,0 C8.37761429,0 7.86332858,0.341333333 7.57761429,0.796444444 C6.8919,1.99111111 7.17761429,4.38044444 8.26332858,6.82666667 C7.63475715,8.59022222 7.06332858,10.2968889 5.46332858,13.312 C3.80618572,13.9946667 0.320471433,15.5875556 0.034757147,17.2942222 C-0.0795285673,17.8062222 0.0919000041,18.3182222 0.491900004,18.7164444 C0.891900004,19.0577778 1.40618572,19.2284444 1.92047143,19.2284444 C4.03475715,19.2284444 6.0919,16.3271111 7.52047143,13.8808889 C8.72047143,13.4826667 10.6061857,12.9137778 12.4919,12.5724444 C14.7204714,14.5066667 16.6633286,14.7911111 17.6919,14.7911111 C19.0633286,14.7911111 19.5776143,14.2222222 19.7490429,13.7102222 C20.0347571,13.1413333 19.8633286,12.5155556 19.4633286,12.0604444 Z M18.0347571,13.0275556 C17.9776143,13.4257778 17.4633286,13.824 16.5490429,13.5964444 C15.4633286,13.312 14.4919,12.8 13.6347571,12.1173333 C14.3776143,12.0035556 16.0347571,11.8328889 17.2347571,12.0604444 C17.6919,12.1742222 18.1490429,12.4586667 18.0347571,13.0275556 Z M8.4919,1.30844444 C8.60618572,1.13777778 8.77761429,1.024 8.94904286,1.024 C9.46332858,1.024 9.57761429,1.64977778 9.57761429,2.16177778 C9.52047143,3.35644444 9.2919,4.55111111 8.8919,5.68888889 C8.03475715,3.41333333 8.20618572,1.82044444 8.4919,1.30844444 Z M8.37761429,12.3448889 C8.83475715,11.4346667 9.46332858,9.84177778 9.6919,9.15911111 C10.2061857,10.0124444 11.0633286,11.0364444 11.5204714,11.4915556 C11.5204714,11.5484444 9.74904286,11.8897778 8.37761429,12.3448889 Z M5.00618572,14.6204444 C3.6919,16.7822222 2.32047143,18.1475556 1.57761429,18.1475556 C1.46332858,18.1475556 1.34904286,18.0906667 1.23475715,18.0337778 C1.06332858,17.92 1.00618572,17.7493333 1.06332858,17.5217778 C1.23475715,16.7253333 2.72047143,15.6444444 5.00618572,14.6204444 Z"></path>
            </svg>`;

    if(type.match(/wordprocessingml|msword|opendocument.text/g))
        return `
            <svg width="35px" height="32px" viewBox="0 0 35 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <defs>
                    <linearGradient x1="17.3720208%" y1="-4.58958232%" x2="82.6279792%" y2="104.589482%" id="linearGradient-word">
                        <stop stop-color="#2368C4" offset="0%"></stop>
                        <stop stop-color="#1A5DBE" offset="50%"></stop>
                        <stop stop-color="#1146AC" offset="100%"></stop>
                    </linearGradient>
                </defs>
            
                <path d="M33.5080008,0 L9.63151116,0 C8.8075116,0 8.13953056,0.656530286 8.13953056,1.46640457 C8.13953056,1.46640457 8.13953056,1.46640457 8.13953056,1.46640457 L8.13953056,8 L21.9767325,12 L34.9999814,8 L34.9999814,1.46640457 C34.9999814,0.656530286 34.3320004,0 33.5080008,0 L33.5080008,0 Z" id="Path" fill="#41A5EE"></path>
                <polygon id="Path" fill="#2B7CD3" points="34.9999814 8 8.13953056 8 8.13953056 16 21.9767325 18.4 34.9999814 16"></polygon>
                <polygon id="Path" fill="#185ABD" points="8.13953056 16 8.13953056 24 21.1627794 25.6 34.9999814 24 34.9999814 16"></polygon>
                <path d="M9.63151116,32 L33.5080194,32 C34.332019,32 35,31.3434697 35,30.5335954 L35,30.5335954 L35,24 L8.13953056,24 L8.13953056,30.5335954 C8.13953056,31.3434697 8.8075116,32 9.63151116,32 L9.63151116,32 Z" id="Path" fill="#103F91"></path>
                <path d="M18.0428927,6.4 L8.13953056,6.4 L8.13953056,26.4 L18.0428927,26.4 C18.865776,26.3973669 19.5321943,25.7423726 19.5348733,24.9335954 L19.5348733,7.86640457 C19.5321943,7.05762743 18.865776,6.40263314 18.0428927,6.4 Z" id="Path" fill="#000000" opacity="0.1"></path>
                <path d="M17.2289397,7.2 L8.13953056,7.2 L8.13953056,27.2 L17.2289397,27.2 C18.051823,27.1973669 18.7182412,26.5423726 18.7209203,25.7335954 L18.7209203,8.66640457 C18.7182412,7.85762743 18.051823,7.20263314 17.2289397,7.2 Z" id="Path" fill="#000000" opacity="0.2"></path>
                <path d="M17.2289397,7.2 L8.13953056,7.2 L8.13953056,25.6 L17.2289397,25.6 C18.051823,25.5973669 18.7182412,24.9423726 18.7209203,24.1335954 L18.7209203,8.66640457 C18.7182412,7.85762743 18.051823,7.20263314 17.2289397,7.2 Z" id="Path" fill="#000000" opacity="0.2"></path>
                <path d="M16.4149866,7.2 L8.13953056,7.2 L8.13953056,25.6 L16.4149866,25.6 C17.2378699,25.5973669 17.9042882,24.9423726 17.9069672,24.1335954 L17.9069672,8.66640457 C17.9042882,7.85762743 17.2378699,7.20263314 16.4149866,7.2 Z" id="Path" fill="#000000" opacity="0.2"></path>
                <path d="M1.4919806,7.2 L16.4149866,7.2 C17.2389862,7.2 17.9069672,7.85653029 17.9069672,8.66640457 L17.9069672,23.3336137 C17.9069672,24.143488 17.2389862,24.8000183 16.4149866,24.8000183 L1.4919806,24.8000183 C0.66798104,24.8000183 0,24.143488 0,23.3336137 L0,8.66640457 C0,7.85653029 0.66798104,7.2 1.4919806,7.2 Z" id="Path" fill="url(#linearGradient-word)"></path>
                <path d="M6.12256419,18.4464091 C6.1518665,18.6728046 6.17140137,18.8696137 6.1803502,19.0384091 L6.21452693,19.0384091 C6.22755018,18.8784091 6.25467575,18.6856046 6.29592223,18.4600137 C6.33716872,18.2344046 6.3743408,18.0437394 6.40743845,17.8880183 L7.97673995,11.2336091 L10.0059296,11.2336091 L11.6338357,17.7880137 C11.7284217,18.1955657 11.796124,18.6086949 11.8365146,19.0248046 L11.8633797,19.0248046 C11.8937239,18.6216594 11.950282,18.2208549 12.032682,17.8248046 L13.3309324,11.2304091 L15.1777966,11.2304091 L12.8970908,20.7664091 L10.7393059,20.7664091 L9.19279511,14.4512 C9.14803235,14.2696046 9.09675796,14.032 9.04059054,13.7399954 C8.98442313,13.4479909 8.9494278,13.2343954 8.93558595,13.0999954 L8.90872085,13.0999954 C8.89082318,13.2551863 8.85580925,13.4856046 8.80371625,13.7911954 C8.75162325,14.0968046 8.70983723,14.3229257 8.67835818,14.4695954 L7.22462872,20.7648 L5.03021128,20.7648 L2.73731948,11.2335909 L4.61754173,11.2335909 L6.03138284,17.9015863 C6.06314096,18.0384 6.09326188,18.2208 6.12256419,18.4464091 Z" id="Path" fill="#FFFFFF"></path>
            </svg>`;

    if(type.match(/spreadsheetml|ms-excel|spreadsheet/g))
        return `
            <svg width="35px" height="32px" viewBox="0 0 35 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <defs>
                    <linearGradient x1="17.3720336%" y1="-4.58942765%" x2="82.6280518%" y2="104.58951%" id="linearGradient-excel">
                        <stop stop-color="#18884F" offset="0%"></stop>
                        <stop stop-color="#117E43" offset="50%"></stop>
                        <stop stop-color="#0B6631" offset="100%"></stop>
                    </linearGradient>
                </defs>
            
                <path d="M21.9767442,15.2 L8.13953488,12.8 L8.13953488,30.5336038 C8.13953488,31.3434742 8.80751174,32 9.63150781,32 L9.63150781,32 L33.5080271,32 C34.3320231,32 35,31.3434742 35,30.5336038 L35,30.5336038 L35,24 L21.9767442,15.2 Z" id="Path" fill="#185C37"></path>
                <path d="M21.9767442,0 L9.63150781,0 C8.80751174,0 8.13953488,0.656525822 8.13953488,1.46639624 C8.13953488,1.46639624 8.13953488,1.46639624 8.13953488,1.46639624 L8.13953488,8 L21.9767442,16 L29.3023256,18.4 L35,16 L35,8 L21.9767442,0 Z" id="Path" fill="#21A366"></path>
                <polygon id="Path" fill="#107C41" points="8.13953488 8 21.9767442 8 21.9767442 16 8.13953488 16"></polygon>
                <path d="M18.0429108,6.4 L8.13953488,6.4 L8.13953488,26.4 L18.0429108,26.4 C18.865791,26.3973709 19.5322088,25.7423775 19.5348837,24.9336038 L19.5348837,7.86639624 C19.5322088,7.05762254 18.865791,6.40262911 18.0429108,6.4 Z" id="Path" fill="#000000" opacity="0.1"></path>
                <path d="M17.2289573,7.2 L8.13953488,7.2 L8.13953488,27.2 L17.2289573,27.2 C18.0518375,27.1973709 18.7182553,26.5423775 18.7209302,25.7336038 L18.7209302,8.66639624 C18.7182553,7.85762254 18.0518375,7.20262911 17.2289573,7.2 Z" id="Path" fill="#000000" opacity="0.2"></path>
                <path d="M17.2289573,7.2 L8.13953488,7.2 L8.13953488,25.6 L17.2289573,25.6 C18.0518375,25.5973709 18.7182553,24.9423775 18.7209302,24.1336038 L18.7209302,8.66639624 C18.7182553,7.85762254 18.0518375,7.20262911 17.2289573,7.2 Z" id="Path" fill="#000000" opacity="0.2"></path>
                <path d="M16.4150038,7.2 L8.13953488,7.2 L8.13953488,25.6 L16.4150038,25.6 C17.237884,25.5973709 17.9043018,24.9423775 17.9069767,24.1336038 L17.9069767,8.66639624 C17.9043018,7.85762254 17.237884,7.20262911 16.4150038,7.2 Z" id="Path" fill="#000000" opacity="0.2"></path>
                <path d="M1.49197292,7.2 L16.4149885,7.2 C17.2389846,7.2 17.9069615,7.85652582 17.9069615,8.66639624 L17.9069615,23.3335887 C17.9069615,24.1434592 17.2389846,24.799985 16.4149885,24.799985 L1.49197292,24.799985 C0.667976853,24.799985 0,24.1434742 0,23.3336038 L0,8.66639624 C0,7.85652582 0.667976853,7.2 1.49197292,7.2 Z" id="Path" fill="url(#linearGradient-excel)"></path>
                <path d="M4.62081013,20.7664075 L7.75941478,15.9864038 L4.88372093,11.2327962 L7.1969691,11.2327962 L8.76627143,14.2727962 C8.91116279,14.5615925 9.01045747,14.7759925 9.06418605,14.9175887 L9.08453106,14.9175887 C9.18763184,14.6871887 9.29615897,14.4634592 9.41011246,14.246385 L11.0876668,11.2344038 L13.2112676,11.2344038 L10.2623103,15.9600075 L13.2861666,20.7664075 L11.0266317,20.7664075 L9.21395349,17.4296038 C9.12856862,17.2876319 9.0561153,17.1385089 8.9974495,16.9840075 L8.97059286,16.9840075 C8.91749099,17.135369 8.84704007,17.2803005 8.76058522,17.4160075 L6.89419369,20.7664075 L4.62081013,20.7664075 Z" id="Path" fill="#FFFFFF"></path>
                <path d="M33.5080271,0 L21.9767442,0 L21.9767442,8 L35,8 L35,1.46639624 C35,0.656525822 34.3320231,0 33.5080271,0 L33.5080271,0 Z" id="Path" fill="#33C481"></path>
                <polygon id="Path" fill="#107C41" points="21.9767442 16 35 16 35 24 21.9767442 24"></polygon>
            </svg>`;

    if(type.match(/presentation|ms-powerpoint/g))
        return `
            <svg width="35px" height="32px" viewBox="0 0 35 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <defs>
                    <linearGradient x1="17.3720425%" y1="-4.58953436%" x2="82.6280695%" y2="104.589534%" id="linearGradient-powerpoint">
                        <stop stop-color="#CA4C28" offset="0%"></stop>
                        <stop stop-color="#C5401E" offset="50%"></stop>
                        <stop stop-color="#B62F14" offset="100%"></stop>
                    </linearGradient>
                </defs>

                <path d="M21.1627907,17.6 L18.7209302,0 L18.5385974,0 C9.65937655,0.0254781635 2.46778302,7.09378723 2.44186047,15.8207928 L2.44186047,16 L21.1627907,17.6 Z" id="Path" fill="#ED6C47"></path>
                <path d="M18.9032631,0 L18.7209302,0 L18.7209302,16 L26.8604651,19.2 L35,16 L35,15.8207928 C34.9740774,7.09378723 27.7824839,0.0254781635 18.9032631,0 Z" id="Path" fill="#FF8F6B"></path>
                <path d="M35,16 L35,16.176 C34.974515,24.9049586 27.7812078,31.9749518 18.9,32 L18.5418605,32 C9.66065262,31.9749518 2.4673455,24.9049586 2.44186047,16.176 L2.44186047,16 L35,16 Z" id="Path" fill="#D35230"></path>
                <path d="M19.5348837,7.86399104 L19.5348837,24.935991 C19.5308367,25.5292094 19.1650772,26.0621187 18.6069767,26.2879821 C18.4292742,26.3618544 18.2383005,26.3999821 18.0453397,26.3999821 L6.28372093,26.3999821 C6.05581395,26.1439821 5.83605563,25.8719821 5.63255814,25.5999821 C3.55884528,22.881075 2.43916248,19.5740202 2.44184193,16.1759821 L2.44184193,15.8239821 C2.43710253,12.7590414 3.34847522,9.76023292 5.0627907,7.19998208 C5.24186047,6.92798208 5.42906065,6.65598208 5.63255814,6.39998208 L18.0453397,6.39998208 C18.8654184,6.40609183 19.5286856,7.0579888 19.5348837,7.86399104 Z" id="Path" fill="#000000" opacity="0.1"></path>
                <path d="M18.7209302,8.66400896 L18.7209302,25.736009 C18.7209302,25.9256439 18.6821376,26.1133617 18.6069767,26.288 C18.3771739,26.836533 17.8349514,27.1960224 17.2313862,27.2 L7.02440949,27.2 C6.76687935,26.9430325 6.51977656,26.6761568 6.2837027,26.4 C6.05579572,26.144 5.8360374,25.872 5.63253991,25.6 C3.55882705,22.8810929 2.43914425,19.5740202 2.4418237,16.176 L2.4418237,15.824 C2.4370843,12.7590594 3.34845699,9.76025084 5.06277247,7.2 L17.2313862,7.2 C18.0514649,7.20609183 18.7147322,7.8579888 18.7209302,8.66400896 Z" id="Path" fill="#000000" opacity="0.2"></path>
                <path d="M18.7209302,8.66400896 L18.7209302,24.136009 C18.7147322,24.9420112 18.0514649,25.5939082 17.2314045,25.6000179 L5.63255814,25.6000179 C3.55884528,22.8811109 2.43916248,19.5740381 2.44184193,16.1760179 L2.44184193,15.8240179 C2.43710253,12.7590773 3.34847522,9.76026876 5.0627907,7.20001792 L17.2313862,7.20001792 C18.0514649,7.20609183 18.7147322,7.8579888 18.7209302,8.66400896 Z" id="Path" fill="#000000" opacity="0.2"></path>
                <path d="M17.9069767,8.66400896 L17.9069767,24.136009 C17.9007787,24.9420112 17.2375114,25.5939082 16.417451,25.6000179 L5.63255814,25.6000179 C3.55884528,22.8811109 2.43916248,19.5740381 2.44184193,16.1760179 L2.44184193,15.8240179 C2.43710253,12.7590773 3.34847522,9.76026876 5.0627907,7.20001792 L16.4174327,7.20001792 C17.2375114,7.20609183 17.9007787,7.8579888 17.9069767,8.66400896 Z" id="Path" fill="#000000" opacity="0.2"></path>
                <path d="M1.49196854,7.2 L16.41499,7.2 C17.238988,7.2 17.9069585,7.85653751 17.9069585,8.66639194 L17.9069585,23.3335901 C17.9069585,24.1434625 17.2389698,24.8 16.41499,24.8 L1.49196854,24.8 C0.66798875,24.8 0,24.1434625 0,23.3336081 L0,8.66639194 C0,7.85653751 0.66798875,7.2 1.49196854,7.2 Z" id="Path" fill="url(#linearGradient-powerpoint)"></path>
                <path d="M9.11627907,11.1112027 C10.0877184,11.0467727 11.0507904,11.324112 11.8332613,11.8936081 C12.4858824,12.4662576 12.8345973,13.3018768 12.7790698,14.16 C12.7897341,14.756533 12.6280007,15.3438029 12.3126826,15.8535991 C11.9934451,16.3546338 11.5335113,16.754168 10.9883721,17.0040045 C10.3651553,17.2888869 9.68378604,17.4295543 8.9966197,17.4152027 L7.10906794,17.4152027 L7.10906794,20.8631937 L5.17592385,20.8631937 L5.17592385,11.1112027 L9.11627907,11.1112027 Z M7.10744551,15.9256081 L8.77117373,15.9256081 C9.29861194,15.963682 9.82194849,15.8102576 10.2419959,15.4944143 C10.5894164,15.1668533 10.7715123,14.7049317 10.7393187,14.2328152 C10.7393187,13.1581456 10.1038881,12.6208108 8.83304513,12.6208108 L7.10744551,12.6208108 L7.10744551,15.9256081 L7.10744551,15.9256081 Z" id="Shape" fill="#FFFFFF"></path>
            </svg>`;

    if(type.match(/zip|rar|7z-compressed/g))
        return `
            <svg width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <path d="M5.65714286,0 L26.3428571,0 C29.4857143,0 32,2.60740741 32,5.86666667 L32,26.1333333 C32,29.3925926 29.4857143,32 26.3428571,32 L5.65714286,32 C2.51428571,32 0,29.3925926 0,26.1333333 L0,5.86666667 C0,2.60740741 2.51428571,0 5.65714286,0 Z" id="Path" fill="#727272"></path>
                <path fill="#FFF" transform="translate(14.080000, 0.000000)" d="M3.84,17.28 L3.84,23.68 L0,23.68 L0,17.28 L3.84,17.28 Z M3.2,20.48 L0.64,20.48 L0.64,23.04 L3.2,23.04 L3.2,20.48 Z M1.92,11.52 L1.92,13.44 L3.84,13.44 L3.84,15.36 L1.92,15.36 L1.92,13.44 L0,13.44 L0,11.52 L1.92,11.52 Z M0,9.6 L0,7.68 L1.92,7.68 L1.92,9.6 L3.84,9.6 L3.84,11.52 L1.92,11.52 L1.92,9.6 L0,9.6 Z M3.84,5.76 L3.84,7.68 L1.92,7.68 L1.92,5.76 L3.84,5.76 Z M1.92,3.84 L1.92,5.76 L0,5.76 L0,3.84 L1.92,3.84 Z M3.84,1.92 L3.84,3.84 L1.92,3.84 L1.92,1.92 L3.84,1.92 Z M1.92,0 L1.92,1.92 L0,1.92 L0,0 L1.92,0 Z" id="Combined-Shape"></path>
            </svg>`;

    if(type.match(/json/g))
        return `
        <svg  width="32px" height="32px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" style="enable-background:new 0 0 56 56" xml:space="preserve">
            <path style="fill:#e2ecf1" d="M36.985 0H7.963C7.155 0 6.5.655 6.5 1.926V55c0 .345.655 1 1.463 1h40.074c.808 0 1.463-.655 1.463-1V12.978c0-.696-.093-.92-.257-1.085L37.607.257C37.442.093 37.218 0 36.985 0z"/><path style="fill:#d9d7ca" d="M37.5.151V12h11.849z"/>
            <path style="fill:var(--color-primary)" d="M48.037 56H7.963c-.808 0-1.463-.655-1.463-1.463V39h43v15.537c0 .808-.655 1.463-1.463 1.463z"/>
            <path style="fill:#fff" d="M17.021 42.719v7.848c0 .474-.087.873-.26 1.196s-.405.583-.697.779-.627.333-1.005.41c-.378.077-.768.116-1.169.116-.2 0-.436-.021-.704-.062s-.547-.104-.834-.191-.563-.185-.827-.294-.487-.232-.67-.369l.697-1.107c.091.063.221.13.39.198s.354.132.554.191.41.111.629.157.424.068.615.068c.483 0 .868-.094 1.155-.28s.439-.504.458-.95v-7.711h1.668zM25.184 50.238c0 .364-.075.718-.226 1.06s-.362.643-.636.902-.61.467-1.012.622-.856.232-1.367.232c-.219 0-.444-.012-.677-.034s-.467-.062-.704-.116c-.237-.055-.463-.13-.677-.226s-.398-.212-.554-.349l.287-1.176c.128.073.289.144.485.212s.398.132.608.191.419.107.629.144.405.055.588.055c.556 0 .982-.13 1.278-.39s.444-.645.444-1.155c0-.31-.104-.574-.314-.793s-.472-.417-.786-.595-.654-.355-1.019-.533-.706-.388-1.025-.629-.583-.526-.793-.854-.314-.738-.314-1.23c0-.446.082-.843.246-1.189s.385-.641.663-.882.602-.426.971-.554.759-.191 1.169-.191c.419 0 .843.039 1.271.116s.774.203 1.039.376c-.055.118-.118.248-.191.39s-.142.273-.205.396-.118.226-.164.308-.073.128-.082.137c-.055-.027-.116-.063-.185-.109s-.166-.091-.294-.137-.296-.077-.506-.096-.479-.014-.807.014c-.183.019-.355.07-.52.157s-.31.193-.438.321-.228.271-.301.431-.109.313-.109.458c0 .364.104.658.314.882s.47.419.779.588.647.333 1.012.492.704.354 1.019.581.576.513.786.854.318.781.318 1.319zM35.082 47.914c0 .848-.107 1.595-.321 2.242s-.511 1.185-.889 1.613-.82.752-1.326.971-1.06.328-1.661.328-1.155-.109-1.661-.328-.948-.542-1.326-.971-.675-.966-.889-1.613-.321-1.395-.321-2.242.107-1.593.321-2.235.511-1.178.889-1.606.82-.754 1.326-.978 1.06-.335 1.661-.335 1.155.111 1.661.335.948.549 1.326.978.675.964.889 1.606.321 1.387.321 2.235zm-4.238 3.815c.337 0 .658-.066.964-.198s.579-.349.82-.649.431-.695.567-1.183.21-1.082.219-1.784c-.009-.684-.08-1.265-.212-1.743s-.314-.873-.547-1.183-.497-.533-.793-.67-.608-.205-.937-.205c-.337 0-.658.063-.964.191s-.579.344-.82.649-.431.699-.567 1.183c-.137.483-.21 1.075-.219 1.777.009.684.08 1.267.212 1.75s.314.877.547 1.183.497.528.793.67.609.212.937.212zM44.68 42.924V53h-1.668l-3.951-6.945V53h-1.668V42.924h1.668l3.951 6.945v-6.945h1.668z"/>
            <path style="fill:var(--color-primary)" d="M19.5 19v-4c0-.551.448-1 1-1 .553 0 1-.448 1-1s-.447-1-1-1c-1.654 0-3 1.346-3 3v4c0 1.103-.897 2-2 2-.553 0-1 .448-1 1s.447 1 1 1c1.103 0 2 .897 2 2v4c0 1.654 1.346 3 3 3 .553 0 1-.448 1-1s-.447-1-1-1c-.552 0-1-.449-1-1v-4c0-1.2-.542-2.266-1.382-3 .84-.734 1.382-1.8 1.382-3z"/>
            <circle style="fill:var(--color-primary)" cx="27.5" cy="18.5" r="1.5"/>
            <path style="fill:var(--color-primary)" d="M39.5 21c-1.103 0-2-.897-2-2v-4c0-1.654-1.346-3-3-3-.553 0-1 .448-1 1s.447 1 1 1c.552 0 1 .449 1 1v4c0 1.2.542 2.266 1.382 3-.84.734-1.382 1.8-1.382 3v4c0 .551-.448 1-1 1-.553 0-1 .448-1 1s.447 1 1 1c1.654 0 3-1.346 3-3v-4c0-1.103.897-2 2-2 .553 0 1-.448 1-1s-.447-1-1-1zM27.5 24c-.553 0-1 .448-1 1v3c0 .552.447 1 1 1s1-.448 1-1v-3c0-.552-.447-1-1-1z"/>
        </svg>`;

    //fallback icon 
    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="32"><defs><linearGradient id="a" y2="-112" gradientUnits="userSpaceOnUse" x2="-80" gradientTransform="translate(2 922.36)" y1="123" x1="105"><stop style="stop-color:#e6e6e6" offset="0"/><stop style="stop-color:#f9f9f9" offset="1"/></linearGradient><linearGradient id="b" y2="957.36" gradientUnits="userSpaceOnUse" x2="80" gradientTransform="translate(2 -2)" y1="944.36" x1="93"><stop style="stop-color:#ccc" offset="0"/><stop style="stop-color:#e6e6e6" offset=".22008"/><stop style="stop-color:#fff" offset=".46933"/><stop style="stop-color:#e6e6e6" offset="1"/></linearGradient></defs><path style="stroke-linejoin:round;fill-rule:evenodd;stroke:gray;stroke-width:1px;fill:url(#a)" d="M82 930.36H22v115h85v-90l-25-25z" transform="translate(0 -924.36)"/><path style="stroke-linejoin:round;fill-rule:evenodd;stroke:gray;stroke-width:1px;fill:url(#b)" d="m107 955.36-25-25c1.8633 8.3333 2.1329 16.667 0 25 9.9055-1.935 17.128-.56751 25 0z" transform="translate(0 -924.36)"/></svg>
    `;
}
