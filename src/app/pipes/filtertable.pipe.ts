import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
    name: 'filterTable',
})

@Injectable()
export class FilterTable implements PipeTransform {
    transform(items: any[], field: string, value: string): any[] {
        if (!items) {
            return [];
        }
        if (!field || !value) {
            return items;
        }

        return items.filter(singleItem =>
            singleItem[field].toLowerCase().includes(value.toLowerCase())
        );
    }
}
/**
 * This pipe takes an array if items and checks if the field which is also a parameter on a 
 * single items contains the value the user types. It returns the array of matching items.
 * The Pipe is available through the name filterTable.
 */