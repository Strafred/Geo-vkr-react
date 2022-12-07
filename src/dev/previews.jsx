import React from 'react';
import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox';
import {PaletteTree} from './palette';
import {StationPopup} from "../components/Map";

const ComponentPreviews = () => {
  return (
    <Previews palette={<PaletteTree/>}>
      <ComponentPreview path="/StationPopup">
        <StationPopup/>
      </ComponentPreview>
    </Previews>
  );
};

export default ComponentPreviews;