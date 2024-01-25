


enum Angles {
    //% block="angle x"
    Angle_X,
    //% block="angle y"
    Angle_Y,
    //% block="angle z"
    Angle_Z,
}
enum SortingMethods {
    //% block="accurate"
    Accurate,
    //% block="fast"
    Fast,
    //% block="fast and accurate"
    Fast_and_Accurate,
}
//% color="#279139"
//% icon="\uf1b2"
namespace brohann3D {
    let axchange = 0
    let azchange = 0
    let sizechange = 0
    let aychange = 0

    let sort = 2
    let ct = [
        { indices: [0, 0, 0], color: 13 }
    ];
    let cv = [
        { x: 0, y: 0, z: 0 },


    ];
    //% block="render"
    export function render() {
        function updateCube() {
            let bg = scene.backgroundImage();
            let bgsave = bg.clone()
            let angleX = 0;
            angleX += axchange
            let angleY = 0;
            let angleZ = 0;
            angleY += aychange
            angleZ += azchange
            let centerX = scene.screenWidth() / 2;
            let centerY = scene.screenHeight() / 2;
            let size = 1
            size += sizechange
            let camx = 0
            let camy = 0
            let camz = 0
            let vertices = cv;
            let triangles = ct;
            ct = [
                { indices: [0, 0, 0], color: 0 }
            ];
            cv = [
                { x: 0, y: 0, z: 0 },
            ];

            let cosX = Math.cos(angleX);
            let sinX = Math.sin(angleX);
            let cosY = Math.cos(angleY);
            let sinY = Math.sin(angleY);
            let cosZ = Math.cos(angleZ);
            let sinZ = Math.sin(angleZ);

            let rotatedVertices = vertices.map((vertex, index) => {
                let x = vertex.x;
                let y = vertex.y;
                let z = vertex.z;
                if (!(index > 5 && index < 9)) {
                    x -= camx
                    y -= camy
                    z -= camz
                }
                // rotate y
                let cosY = Math.cos(angleY);
                let sinY = Math.sin(angleY);
                let rotatedX = x * cosY + z * sinY;
                let rotatedZ = -x * sinY + z * cosY;

                // Rotate x
                let cosX = Math.cos(angleX);
                let sinX = Math.sin(angleX);
                let rotatedZ2 = rotatedZ * cosX - y * sinX;
                let rotatedY2 = rotatedZ * sinX + y * cosX;

                // Rotate z
                let cosZ = Math.cos(angleZ);
                let sinZ = Math.sin(angleZ);
                let rotatedX2 = rotatedX * cosZ - rotatedY2 * sinZ;
                let rotatedY3 = rotatedX * sinZ + rotatedY2 * cosZ;

                // perspective
                let scaleFactor = 150 / (150 + rotatedZ2);
                let projectedX = rotatedX2 * scaleFactor;
                let projectedY = rotatedY2 * scaleFactor;

                // screen coordinates
                let screenX = centerX + projectedX;
                let screenY = centerY + projectedY;

                return { x: screenX, y: screenY, z: rotatedZ2 };
            });

            function quicksort(arr: any[], low: number, high: number, rotatedVertices: any[]) {
                if (low < high) {
                    let pivotIndex = choosePivot(arr, low, high, rotatedVertices);
                    let partitionIndex = partition(arr, low, high, rotatedVertices, pivotIndex);

                    quicksort(arr, low, partitionIndex - 1, rotatedVertices);
                    quicksort(arr, partitionIndex + 1, high, rotatedVertices);
                }
            }

            function choosePivot(arr: any[], low: number, high: number, rotatedVertices: any[]): number {
                // Choose the median of three values: low, middle, high
                let middle = Math.floor((low + high) / 2);

                if (averageZ(rotatedVertices, arr[low].indices) > averageZ(rotatedVertices, arr[middle].indices)) {
                    [arr[low], arr[middle]] = [arr[middle], arr[low]];
                }
                if (averageZ(rotatedVertices, arr[low].indices) > averageZ(rotatedVertices, arr[high].indices)) {
                    [arr[low], arr[high]] = [arr[high], arr[low]];
                }
                if (averageZ(rotatedVertices, arr[middle].indices) > averageZ(rotatedVertices, arr[high].indices)) {
                    [arr[middle], arr[high]] = [arr[high], arr[middle]];
                }

                return middle;
            }

            function partition(arr: any[], low: number, high: number, rotatedVertices: any[], pivotIndex: number): number {
                let pivotValue = averageZ(rotatedVertices, arr[pivotIndex].indices);
                let i = low - 1;

                for (let j = low; j <= high; j++) {
                    let currentAverageZ = averageZ(rotatedVertices, arr[j].indices);
                    if (currentAverageZ > pivotValue) {
                        i++;
                        [arr[i], arr[j]] = [arr[j], arr[i]];
                    }
                }

                [arr[i + 1], arr[pivotIndex]] = [arr[pivotIndex], arr[i + 1]];
                return i + 1;
            }

            function averageZ(rotatedVertices: any[], indices: number[]): number {
                return (rotatedVertices[indices[0]].z + rotatedVertices[indices[1]].z + rotatedVertices[indices[2]].z) / 3;
            }

            function quicksort2(triangles: any[], low: number, high: number, rotatedVertices: any[]) {
                if (low < high) {
                    let pi = partition2(triangles, low, high, rotatedVertices);

                    quicksort2(triangles, low, pi - 1, rotatedVertices);
                    quicksort2(triangles, pi + 1, high, rotatedVertices);
                }
            }

            // Partition function for quicksort
            function partition2(triangles: any[], low: number, high: number, rotatedVertices: any[]) {
                let pivot = calculateAverageZ2(triangles[high], rotatedVertices);
                let i = low - 1;

                for (let j = low; j < high; j++) {
                    if (calculateAverageZ2(triangles[j], rotatedVertices) > pivot) {
                        i++;

                        // Swap triangles[i] and triangles[j]
                        let temp = triangles[i];
                        triangles[i] = triangles[j];
                        triangles[j] = temp;
                    }
                }

                // Swap triangles[i + 1] and triangles[high]
                let temp = triangles[i + 1];
                triangles[i + 1] = triangles[high];
                triangles[high] = temp;

                return i + 1;
            }

            function calculateAverageZ2(triangle: { indices: number[] }, rotatedVertices: { z: number }[]) {
                let z = (rotatedVertices[triangle.indices[0]].z + rotatedVertices[triangle.indices[1]].z + rotatedVertices[triangle.indices[2]].z) / 3;
                return z;
            }



            if (sort === 0) {
                triangles.sort((b, a) => {
                    let zA = (rotatedVertices[a.indices[0]].z + rotatedVertices[a.indices[1]].z + rotatedVertices[a.indices[2]].z) / 3;
                    let zB = (rotatedVertices[b.indices[0]].z + rotatedVertices[b.indices[1]].z + rotatedVertices[b.indices[2]].z) / 3;
                    return zA - zB;
                });
            } else if (sort === 1){
                quicksort(triangles, 0, triangles.length - 1, rotatedVertices);

            }else  if (sort === 2){
                quicksort2(triangles, 0, triangles.length - 1, rotatedVertices);

            }



            for (let i = 0; i < triangles.length; i++) {
                let triangle = triangles[i];
                let indices = triangle.indices;
                let color = triangle.color;

                //scene.backgroundImage().fillTriangle(rotatedVertices[indices[0]].x, rotatedVertices[indices[0]].y, rotatedVertices[indices[1]].x, rotatedVertices[indices[1]].y, rotatedVertices[indices[2]].x, rotatedVertices[indices[2]].y, color);
                helpers.imageFillTriangle(bg, rotatedVertices[indices[0]].x, rotatedVertices[indices[0]].y, rotatedVertices[indices[1]].x, rotatedVertices[indices[1]].y, rotatedVertices[indices[2]].x, rotatedVertices[indices[2]].y, color)

            }
            rotatedVertices.length = 0;
            triangles.length = 0;


        }
        updateCube()
    }

    //% block="add vertice x $x y $y z $z" 
    export function addvertice(x: number, y: number, z: number) {
        function formatvertice(x: number, y: number, z: number) {
            return {
                x, y, z,
            };
        }
        let formattedData = formatvertice(x, y, z,);
        cv.push(formattedData);
    }

    //% block="add triangle indice 1 $one indice 2 $two indice 3 $three color $col"
    export function addtriangle(one: number, two: number, three: number, col: number) {
        function formatTriangle(x: number, y: number, z: number, color: number) {
            return {
                indices: [x, y, z,], color: color
            };
        }
        let formattedData2 = formatTriangle(one, two, three, col);
        ct.push(formattedData2)
    }

    //% block="change $choice by $x"
    export function change(choice: Angles, x: number) {
        if (choice === 0) {
            axchange += x

        } else if (choice === 1) {
            aychange += x
        } else if (choice === 2) {
            azchange += x
        }
    }
    //% block="set $choice to $x"
    export function setangle(choice: Angles, x: number) {
        if (choice === 0) {
            axchange = x

        } else if (choice === 1) {
            aychange = x
        } else if (choice === 2) {
            azchange = x
        }
    }
    //% block="set size to $x"
    export function setsize (x: number) {
        sizechange = x
    }

    //% block="set sorting method to $method"
    export function sortingmethod(method: SortingMethods) {
        if (method === 0) {
            sort = 0
        } else if (method === 1) {
            sort = 1
        } else {
            sort = 2
        }
    }
}

