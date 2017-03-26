import {StoreModel} from "../models/StoreModel";
import {AdnetTargetModel} from "./AdnetTargetModel";
import {AdnetActions} from "./AdnetActions";
import {AdnetPackageModel} from "./AdnetPackageModel";

// import * as moment_ from "moment";
// export const moment = moment_["default"];

export class AdnetReportModel extends StoreModel {

    constructor(data: any = {}) {
        super(data);
    }

    public getId() {
        return this.getKey('Key');
    }

    public getCustomerId() {
        return this.getKey('Value').customerId;
    }

    public getAbsoluteDate() {
        return this.getKey('Value').absoluteDate;
    }

    public getAbsolutDateFormatted() {
        var value = this.getKey('Value').absolutMonth;
        var year: any = Math.floor(value / 12);
        var month = value % 12;
        return month + '/' + year;
    }

    public getHourAbsolutDateFormatted(i_paidId) {
        var value = this.getKey('Value').absolutMonth;
        var year: any = Math.floor(value / 12);
        var month = value % 12;
        return month + '/' + year;
    }

    public getAbsolutDateJson() {
        var value = this.getKey('Value').absolutMonth;
        var year: any = Math.floor(value / 12);
        var month = value % 12;
        return {month,year};
    }

    public getTargetId() {
        return this.getKey('Value').targetId;
    }

    public getReportEnum() {
        return this.getKey('Value').reportEnum;
    }

    public getAbsolutMonth() {
        return this.getKey('Value').absolutMonth;
    }

    public getHourlyRate() {
        return this.getKey('Value').hourlyRate;
    }

    public getHourlyRateFormat() {
        return StringJS(this.getHourlyRate()).toCurrency('us');
    }

    public getAvgHourlyRate() {
        return this.getKey('Value').avgHourlyRate;
    }

    public getAvgHourlyRateFormat() {
        return StringJS(this.getAvgHourlyRate()).toCurrency('us');
    }

    public getTotalHourlyFormat() {
        return StringJS(this.getTotalPrice() * 3600 / this.getDurationSize()).toCurrency();
    }

    public getAvgScreenArea() {
        return this.getKey('Value').avgScreenArea;
    }

    public getAvgScreenAreaFormat() {
        return StringJS(this.getAvgScreenArea() * 100).toFloat(2) + '%';
    }

    public getCalcSizeFormat() {
        var totalDurationSize =  this.getKey('Value').totalDuration * this.getKey('Value').avgArea;
        var totalTargetSize = 100 * totalDurationSize / this.getKey('Value').totalDuration;
        return StringJS(totalTargetSize).toPercent();
    }

    public getTargetTotalPriceFormat() {
        var totalDurationSize =  this.getKey('Value').totalDuration * this.getKey('Value').avgArea;
        var totalPrice = this.getKey('Value').totalPrice * this.getKey('Value').totalDuration / totalDurationSize;
        return StringJS(totalPrice).toCurrency();
    }

    public getTotalPriceFormat() {
        return StringJS(this.getTotalPrice() * this.getTotalDuration() / this.getDurationSize()).toCurrency();
    }

    public getTotalSizeFormat() {
        return StringJS(this.getDurationSize() / this.getTotalDuration() * 100).toPercent();
    }

    public getTotalPriceSizeFormat() {
        return StringJS(this.getTotalPrice()).toCurrency();
    }

    public getTotalCountFormat() {
        return StringJS(this.getTotalCount()).toInt();
    }

    public getDay() {
        var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        var {month, year} = this.getAbsolutDateJson();
        var relativeHour = parseInt(this.getKey('Value').relativeHour);
        var monthDay = relativeHour/24;
        var date:Date = new Date(year, month, monthDay + 1);
        return days[date.getDay()];
    }

    public getHour() {
        var relativeHour = parseInt(this.getKey('Value').relativeHour);
        return relativeHour % 24;
    }

    public getRelativeHour() {
        return this.getKey('Value').relativeHour;
    }

    public getHourFormat() {
        return this.getHour() + ':00';
    }

    public getTargetIp() {
        return this.getKey('Value').targetIp;
    }

    public getPackageName(i_adnetAction: AdnetActions) {
        var packageContentId = parseInt(this.getKey('Value').packageContentId);
        var adnetPackageModel:AdnetPackageModel = i_adnetAction.getPackageModelFromContentId(packageContentId);
        return adnetPackageModel.getName();
    }

    public getPackageChannelFromContentId(i_adnetAction: AdnetActions) {
        var packageContentId = parseInt(this.getKey('Value').packageContentId);
        var adnetPackageModel:AdnetPackageModel = i_adnetAction.getPackageModelFromContentId(packageContentId);
        return adnetPackageModel.getChannel();
    }

    public getPackageContent(i_adnetAction: AdnetActions) {
        var packageContentId = parseInt(this.getKey('Value').packageContentId);
        var content:any = i_adnetAction.getPackageContentFromContentId(packageContentId);
        return content.Value.contentLabel;
    }

    public getTargetNameFromId(i_adnetAction: AdnetActions) {
        var adnetTargetModel: AdnetTargetModel = i_adnetAction.getTargetModel(this.getTargetId())
        return adnetTargetModel.getName();
    }

    public getCustomerNameFromId(i_adnetAction: AdnetActions) {
        return i_adnetAction.getCustomerName(this.getCustomerId())
    }

    public getPackagesNameFromContentId(i_adnetAction: AdnetActions) {
        var packageContentId = parseInt(this.getKey('Value').packageContentId);
        var adnetPackageModel:AdnetPackageModel = i_adnetAction.getPackageModelFromContentId(packageContentId);
        return adnetPackageModel.getName();
    }

    public getCustomerNameFromTargetId(i_adnetAction: AdnetActions) {
        var adnetTargetModel: AdnetTargetModel = i_adnetAction.getTargetModel(this.getTargetId())
        var customerId = adnetTargetModel.getCustomerId();
        return i_adnetAction.getCustomerName(customerId);
    }

    public getTargetType(i_adnetAction: AdnetActions) {
        var adnetTargetModel: AdnetTargetModel = i_adnetAction.getTargetModel(this.getTargetId())
        return adnetTargetModel.getTargetTypeName();
    }

    public getCurrentDebit() {
        return this.getKey('Value').currentDebit;
    }

    public getCurrentDebitFormat() {
        return StringJS(this.getKey('Value').currentDebit).toCurrency();
    }

    public getBalanceFormat() {
        var total = (this.getCurrentDebit()) - (this.getPrevDebit());
        return StringJS(total).toCurrency();
    }

    public getPrevDebit() {
        return this.getKey('Value').prevDebit;
    }

    public getPrevDebitFormat() {
        return StringJS(this.getKey('Value').prevDebit * 100).toCurrency();
    }

    public getTotalCount() {
        return this.getKey('Value').totalCount;
    }

    public getTotalDuration() {
        return this.getKey('Value').totalDuration;
    }

    public getTotalDurationFormat() {
        return (new Date(this.getTotalDuration() * 1000)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];
    }

    public getPostedTotalPriceFormat() {
        var price = this.getKey('Value').totalPrice;
        return StringJS(price).toCurrency();
    }

    public getTotalPrice() {
        return this.getKey('Value').totalPrice;
    }

    public getDurationSize() {
        return this.getKey('Value').durationSize;
    }

    public setField(i_field, i_value) {
        var value = this.getKey('Value');
        value[i_field] = i_value;
        return this.setKey<AdnetReportModel>(AdnetReportModel, 'Value', value);
    }

}