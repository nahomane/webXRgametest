/*
 * Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

window.gltfLoader = new THREE.GLTFLoader();

const glbFilePaths = ["../assets/ant.glb","../assets/bee.glb","../assets/cockroach.glb","../assets/dung_beetle.glb"];
const glbModelsScales = [0.001,0.05,20,0.5];
window.glbModels = [];
window.mixers = [];
window.currentlyShownModel = null;
window.currentlyShownModelMixer = null;
window.currentlyShownModelIndex = 0;

const promises = glbFilePaths.map(glbFilePath=>{
  const loader = new THREE.GLTFLoader();
  loader.load(glbFilePath, (gltf) => {
    let glbmodel = gltf.scene;
    const index = glbFilePaths.indexOf(glbFilePath);
    glbmodel.scale.set(glbModelsScales[index],glbModelsScales[index],glbModelsScales[index]);
    glbmodel.animations = gltf.animations;
    window.glbModels.push(glbmodel);
    window.mixers.push(new THREE.AnimationMixer(glbmodel));

    // const clip = gltf.animations[0];
    // const action = window.mixers[window.mixers.length - 1].clipAction(clip);
    // action.setDuration(clip.duration * 1000000);
    
  })
});

Promise.all(promises).then(() => {
  
});

function showModelFromMemory(index, position, scene){

  const i = index < 0 ? window.glbModels.length -1 : index >= window.glbModels.length ? 0 : index;

  if(window.currentlyShownModel != null){
    scene.remove(window.currentlyShownModel);
    window.currentlyShownModelMixer.stopAllAction();
  }

  window.currentlyShownModel = window.glbModels[i];
  window.currentlyShownModel.position.copy(position);
  window.currentlyShownModelIndex = i;
  window.currentlyShownModelMixer = window.mixers[i];
  const clip = window.currentlyShownModel.animations[0];
  const action = window.currentlyShownModelMixer.clipAction(clip);
  action.setDuration(clip.duration);
  action.play();
  scene.add(window.currentlyShownModel);

}

/**
 * The Reticle class creates an object that repeatedly calls
 * `xrSession.requestHitTest()` to render a ring along a found
 * horizontal surface.
 */
class Reticle extends THREE.Object3D {
  constructor() {
    super();

    this.loader = new THREE.GLTFLoader();
    this.loader.load("../assets/reticle.glb", (gltf) => {
      const glbreticle = gltf.scene;
      glbreticle.scale.set(1,1,1);
      this.add(glbreticle);
    })

    this.visible = false;
  }
}

window.DemoUtils = {
  /**
   * Creates a THREE.Scene containing lights that case shadows,
   * and a mesh that will receive shadows.
   *
   * @return {THREE.Scene}
   */
  createLitScene() {
    const scene = new THREE.Scene();

    // The materials will render as a black mesh
    // without lights in our scenes. Let's add an ambient light
    // so our material can be visible, as well as a directional light
    // for the shadow.
    const light = new THREE.AmbientLight(0xffffff, 1);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(10, 15, 10);

    // We want this light to cast shadow.
    directionalLight.castShadow = true;

    // Make a large plane to receive our shadows
    const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
    // Rotate our plane to be parallel to the floor
    planeGeometry.rotateX(-Math.PI / 2);

    // Create a mesh with a shadow material, resulting in a mesh
    // that only renders shadows once we flip the `receiveShadow` property.
    const shadowMesh = new THREE.Mesh(planeGeometry, new THREE.ShadowMaterial({
      color: 0x111111,
      opacity: 0.2,
    }));

    // Give it a name so we can reference it later, and set `receiveShadow`
    // to true so that it can render our model's shadow.
    shadowMesh.name = "shadowMesh";
    shadowMesh.receiveShadow = true;
    shadowMesh.position.y = 10000;

    // Add lights and shadow material to scene.
    scene.add(shadowMesh);
    scene.add(light);
    scene.add(directionalLight);

    return scene;
  },

  /**
   * Creates a THREE.Scene containing cubes all over the scene.
   *
   * @return {THREE.Scene}
   */
  createCubeScene() {
    const scene = new THREE.Scene();

    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xff0000 }),
      new THREE.MeshBasicMaterial({ color: 0x0000ff }),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
      new THREE.MeshBasicMaterial({ color: 0xff00ff }),
      new THREE.MeshBasicMaterial({ color: 0x00ffff }),
      new THREE.MeshBasicMaterial({ color: 0xffff00 })
    ];

    const ROW_COUNT = 4;
    const SPREAD = 1;
    const HALF = ROW_COUNT / 2;
    for (let i = 0; i < ROW_COUNT; i++) {
      for (let j = 0; j < ROW_COUNT; j++) {
        for (let k = 0; k < ROW_COUNT; k++) {
          const box = new THREE.Mesh(new THREE.BoxBufferGeometry(0.2, 0.2, 0.2), materials);
          box.position.set(i - HALF, j - HALF, k - HALF);
          box.position.multiplyScalar(SPREAD);
          scene.add(box);
        }
      }
    }
    return scene;
  },
};

/**
 * Toggle on a class on the page to disable the "Enter AR"
 * button and display the unsupported browser message.
 */
function onNoXRDevice() {
  document.body.classList.add("unsupported");
}