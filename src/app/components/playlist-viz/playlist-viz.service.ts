import { Injectable } from '@angular/core';
import { Content } from '../../shared/models/content.model';
import { PieData } from './playlist-viz.component';

@Injectable()
export class PlaylistVizService {
    constructor() { }

    public compute(contents: Content[]): PieData {
        const playlist: Content[] = this.simpleCalculator(contents);
        const pieData: any = this.computePieData(playlist);

        return (pieData || []);
    }

    private computePieData(playlist: Content[]): PieData {
        const colors: string[] = [];
        const data: { name: string, value: number }[] = [];

        const contentMap: Map<string, number> = new Map();

        playlist.forEach((content: Content) => {
            if (contentMap.has(content.name)) {
                const aggr = contentMap.get(content.name) + 1;
                contentMap.delete(content.name);
                contentMap.set(content.name, aggr);
            } else {
                contentMap.set(content.name, 0);
            }

            colors.push(content.color);
            data.push({
                name: content.name + '-' + contentMap.get(content.name).toString(),
                value: 1
            });
        });

        return { colors: colors, data: data };
    }

    private simpleCalculator(contents: Content[]): Content[] {
        let size = 0;

        contents.forEach((content: Content) => size += content.saturation);

        const finalList: Content[] = [];

        contents.forEach((content: Content, i: number) => {
            const pas: number = Math.round(size / content.saturation);

            let firstIndex: number = null;
            let newFirstIndex: number = null;
            let newIndexToInsert: number = null;

            let reste: number = null;
            let indice: number = null;

            Array.from(Array(content.saturation).keys()).forEach((s: number) => {
                let j: number = 0;
                let indexR: number = null;
                let indexL: number = null;

                let index = s * pas;

                if (firstIndex !== null) {
                    index = s * pas + firstIndex;
                }

                if (i >= size) {
                    const lastIndex = getLastIndex(contents[i], finalList);
                    reste = size - lastIndex;
                    newFirstIndex = pas - reste + 1;

                    newIndexToInsert = newFirstIndex + pas * indice;
                    indice++;

                    finalList[newIndexToInsert] = contents[i];
                    removeLastNull(finalList);

                    return;
                }

                // parcourir la liste vers la droite
                for (j = index; j < size; j++) {
                    if (finalList[j] == null) {
                        indexR = j;
                        break;
                    }
                }
                // parcourir la liste vers la gauche
                for (j = index; j < size && j >= 0; j--) {
                    if (finalList[j] == null) {
                        indexL = j;
                        break;
                    }
                }

                if (indexL == null) {
                    finalList[indexR] = contents[i];
                    if (s === 0) {
                        firstIndex = indexR;
                    }
                } else if (indexR == null) {
                    finalList[indexL] = contents[i];
                    if (s === 0) {
                        firstIndex = indexL;
                    }
                } else if (Math.abs(indexR - index) <= Math.abs(indexL - index)) {
                    finalList[indexR] = contents[i];
                    if (s === 0) {
                        firstIndex = indexR;
                    }
                } else {
                    finalList[indexL] = contents[i];
                    if (s === 0) {
                        firstIndex = indexL;
                    }
                }
            });
        });

        return finalList;
    }
}
}


export function getLastIndex(content: Content, contents: Content[]): number {
    return contents.lastIndexOf(content);
}

export function removeLastNull(contents: Content[]): void {
    contents.splice(contents.lastIndexOf(null), 1);
}
