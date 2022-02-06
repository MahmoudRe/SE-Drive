/**
 * Initialize a new instance of AdvanceFileInput.
 * @param {String|HTMLElement} element html element or a selector string
 * @param {(files:FileList) => {}} callback  Callback that called when a new file(s) that has been dropped/added, with FileList obj as the first argument.
 */
export default function DragDropArea(element, callback = () => {}) {
  if (element === "string") element = document.querySelector(element);
  element.classList.add("drag-drop-area");

  // ----------- [ Functionality ] ----------- //

  let dragCounter = 0; //fix flickering issue

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    element.addEventListener(eventName, (e) => {
      //if draggable element is moved, skip this event
      if (e.dataTransfer.effectAllowed === "move" || e.dataTransfer.effectAllowed === "copyMove")
        return;

      e.preventDefault();
      e.stopPropagation();
    });
  });

  element.addEventListener("dragenter", (e) => {
    //if an element from SortableJS is moved, skip this event
    if (e.dataTransfer.effectAllowed === "move" || e.dataTransfer.effectAllowed === "copyMove")
      return;

    dragCounter++;
    element.classList.add("--dragover");
  });

  element.addEventListener("dragleave", (e) => {
    //if an element from SortableJS is moved, skip this event
    if (e.dataTransfer.effectAllowed === "move" || e.dataTransfer.effectAllowed === "copyMove")
      return;

    dragCounter--;
    if (dragCounter === 0) element.classList.remove("--dragover");
  });

  element.addEventListener("drop", (e) => {
    //if an element from SortableJS is moved, skip this event
    if (e.dataTransfer.effectAllowed === "move" || e.dataTransfer.effectAllowed === "copyMove")
      return;

    dragCounter = 0;
    element.classList.remove("--dragover");
    callback(e.dataTransfer.files);
  });
}
