import {Component, Input} from "@angular/core";
import {AdnetCustomerModel} from "../../../../adnet/AdnetCustomerModel";

@Component({
    selector: 'AdnetConfig',
    template: `
         <div>
             <tabs *ngIf="adnetCustomerId != -1">
                <tab [tabtitle]="'Setup'">                      
                  <AdnetConfigCustomer [adnetCustomerModel]="adnetCustomerModel"></AdnetConfigCustomer>
                </tab>          
                <tab [tabtitle]="'Rates'">
                  <AdnetConfigRates [adnetCustomerModel]="adnetCustomerModel"></AdnetConfigRates>
                </tab>
                <tab [tabtitle]="'Targets'">
                    <AdnetConfigTargets [adnetCustomerModel]="adnetCustomerModel"></AdnetConfigTargets>                    
                </tab>
            </tabs>
         </div>
    `
})

export class AdnetConfig {

    @Input()
    set setAdnetCustomerModel(i_adnetCustomerModel: AdnetCustomerModel) {
        this.adnetCustomerModel = i_adnetCustomerModel;
        if (this.adnetCustomerModel)
            this.adnetCustomerId = this.adnetCustomerModel.customerId();
    }

    private adnetCustomerId: number = -1;
    private adnetCustomerModel: AdnetCustomerModel;
}