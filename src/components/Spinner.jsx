import React from 'react';
import { ReactComponent as SpinnerSVG } from '../assets/spinner.svg';

/**
 *
 * @param {Object} props
 * @param {boolean} floating whether the spinner should has absolute positioning, default false.
 * @param {string} overlayColor color string for the overlay color, default to 'var(--color-bg)'.
 * @param {number} overlayOpacity number between [0, 1] to represent opacity css attribute for the overlay background.
 * @returns
 */
export default function Spinner(props) {
  return (
    <div
      style={{
        position: props.floating ? 'absolute' : undefined,
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        display: 'grid',
        placeItems: 'center',
        zIndex: 100,
      }}
    >
      <SpinnerSVG style={{ zIndex: 101 }} />
      {props.floating && (
        //overlay background
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: props.overlayColor || 'var(--color-bg)',
            boxShadow: `0 0 5px 2px ${props.overlayColor || 'var(--color-bg)'}`,
            opacity:
              props.overlayOpacity || props.overlayOpacity === 0
                ? props.overlayOpacity
                : 0.75,
            zIndex: 100,
          }}
        ></div>
      )}
    </div>
  );
}
