/** Common Library **/
import {Injectable} from "@angular/core";
import {AppStore} from "angular2-redux-util";
import * as Immutable from "immutable";
import {List, Map} from "immutable";
import {PrivelegesModel} from "./reseller/PrivelegesModel";
import * as _ from "lodash";
import * as xml2js from "xml2js";
import * as moment_ from "moment";

export const moment = moment_["default"];

@Injectable()
export class Lib {
    /**
     *
     * @param dateString format of date + time: /Date(1469923200000+0000)/"
     * @returns {any}
     * @constructor
     */
    static ProcessDateField(dateString: string, addDay: boolean = false): any {
        if (_.isUndefined(dateString))
            return '';
        var epoc = dateString.match(/Date\((.*)\)/)
        if (epoc[1]) {
            var date = epoc[1].split('+')[0]
            var time = epoc[1].split('+')[1]
            var result;
            //todo: adding +1 on save to server hack, need to ask Alon
            if (addDay) {
                result = moment(Number(date)).add(1, 'day');
            } else {
                result = moment(Number(date));
            }
            return moment(result).format('YYYY-MM-DD');
            /** moment examples
             var a = moment().unix().format()
             console.log(moment.now());
             console.log(moment().format('dddd'));
             console.log(moment().startOf('day').fromNow());
             **/
        }
    }

    /**
     *
     * @param dateString format of date + time: /Date(1469923200000+0000)/"
     * @returns {any}
     * @constructor
     */
    static ProcessDateFieldToUnix(dateString: string, addDay: boolean = false): any {
        if (_.isUndefined(dateString))
            return '';
        //todo: adding +1 on save to server hack, need to ask Alon
        if (addDay) {
            return moment(dateString, 'YYYY-MM-DD').add(0, 'day').valueOf();
        } else {
            return moment(dateString, 'YYYY-MM-DD').valueOf();
        }
    }

    static CleanCharForXml(value: any): any {
        var clean = function (value: string) {
            if (_.isUndefined(value))
                return '';
            if (_.isNull(value))
                return '';
            if (_.isNumber(value))
                return value;
            if (_.isBoolean(value))
                return value;
            value = value.replace(/\}/g, ' ');
            value = value.replace(/%/g, ' ');
            value = value.replace(/{/g, ' ');
            value = value.replace(/"/g, '`');
            value = value.replace(/'/g, '`');
            value = value.replace(/&/g, 'and');
            value = value.replace(/>/g, ' ');
            value = value.replace(/</g, ' ');
            value = value.replace(/\[/g, ' ');
            value = value.replace(/]/g, ' ');
            value = value.replace(/#/g, ' ');
            value = value.replace(/\$/g, ' ');
            value = value.replace(/\^/g, ' ');
            value = value.replace(/;/g, ' ');
            return value
        }
        if (_.isUndefined(value))
            return '';
        if (_.isNull(value))
            return '';
        if (_.isNumber(value))
            return value;
        if (_.isBoolean(value))
            return value;
        if (_.isString(value))
            return clean(value);
        _.forEach(value, (v, k) => {
            // currently we don't support / clean arrays
            if (_.isArray(value[k]))
                return value[k] = v;
            value[k] = clean(v);
        });
        return value;
    }

    static UnionList(a: List<any>, b: List<any>) {
        return a.toSet().union(b.toSet()).toList();
    }

    static ProcessHourStartEnd(value: string, key: string): any {
        if (_.isUndefined(!value))
            return '';
        if (key == 'hourStart')
            return `${value}:00`;
        return `${value}:59`;
    }

    /**
     * CheckFoundIndex will check if a return value is -1 and error out if in dev mode (list.findIndex or indexOf for example)
     * @param i_value
     * @param i_message
     * @returns {number}
     * @constructor
     */
    static CheckFoundIndex(i_value: number, i_message: string = 'CheckFoundIndex did not find index'): number {
        if (i_value === -1) {
            console.log(i_message);
            if (Lib.DevMode()) {
                alert(i_message);
                throw Error(i_message);
            }
        }
        return i_value;
    }

    // static GetCompSelector(i_constructor) {
    //     return 'need to fix 2';
        // if (!Lib.DevMode())
        //     return;
        // var annotations = Reflect.getMetadata('annotations', i_constructor);
        // var componentMetadata = annotations.find(annotation => {
        //     return (annotation instanceof Component);
        // });
        // return componentMetadata.selector;
    // }

    static BootboxHide(i_time = 1500) {
        setTimeout(() => {
            bootbox.hideAll();
        }, i_time)
    }

    static DateToAbsolute(year, month) {
        return year * 12 + month;
    }

    static DateFromAbsolute(value: number) {
        var year = Math.floor(value / 12);
        var month = value % 12 + 1;
        return {
            year,
            month
        }
    }

    static MapOfIndex(map: Map<string,any>, index: number, position: "first" | "last"): string {
        var mapJs = map.toJS();
        var mapJsPairs = _.toPairs(mapJs);
        var offset = position == 'first' ? 0 : 1;
        if (mapJsPairs[index] == undefined)
            return "0"
        return mapJsPairs[index][offset];
    }

    /**
     *  PrivilegesXmlTemplate will generate a template for priveleges in 2 possible modes
     *
     *  mode 1: just a raw template (we will ignore the values set) and this is the mode when
     *  no selPrivName and appStore params are given
     *
     *  mode 2: is when we actually serialize data to save to server and in this mode we do pass
     *  in the selPrivName and appStore which we use to retrieve current values from user appStore
     *  and generate the final XML to save to server
     *
     * @param selPrivName
     * @param appStore
     * @param callBack
     * @constructor
     */
    static PrivilegesXmlTemplate(defaultValues: boolean, selPrivId: string, appStore: AppStore = null, callBack: (err, result) => any) {
        // const parseString = require('xml2js').parseString;
        const parseString = xml2js.parseString;

        var getAttributeGroup = (tableName: string, attribute: string) => {
            if (_.isNull(appStore) || defaultValues)
                return 1;
            var result = 0;
            var reseller = appStore.getState().reseller;
            var privileges = reseller.getIn(['privileges']);
            privileges.forEach((i_privelegesModel: PrivelegesModel, counter) => {
                if (i_privelegesModel.getPrivelegesId() == selPrivId) {
                    i_privelegesModel.getColumns().forEach((group, c) => {
                        if (group.get('tableName') == tableName)
                            return result = group.get(attribute)
                    })
                }
            })
            return result;
        }

        var getPrivilegesTable = (tableName: string, attribute: string) => {
            if (_.isNull(appStore) || defaultValues)
                return 7;
            var result = 0;
            var reseller = appStore.getState().reseller;
            var privileges = reseller.getIn(['privileges']);
            privileges.forEach((i_privelegesModel: PrivelegesModel, counter) => {
                if (i_privelegesModel.getPrivelegesId() == selPrivId) {
                    i_privelegesModel.getColumns().forEach((group, c) => {
                        if (group.get('tableName') == tableName)
                            return result = group.getIn(['columns', attribute])
                    })
                }
            })
            return result;
        }
        var xmlData = `
          <Privilege>
              <Groups>
                <Group name="Global" visible="${getAttributeGroup('Global', 'visible')}">
                  <Tables global_settings="${getPrivilegesTable('Global', 'global_settings')}"/>
                </Group>
                <Group name="Screens" visible="${getAttributeGroup('Screens', 'visible')}">
                  <Tables boards="${getPrivilegesTable('Screens', 'boards')}" board_templates="${getPrivilegesTable('Screens', 'board_templates')}" board_template_viewers="${getPrivilegesTable('Screens', 'board_template_viewers')}"/>
                </Group>
                <Group name="Resources" visible="${getAttributeGroup('Resources', 'visible')}" resourceMode="${getAttributeGroup('Resources', 'resourceMode')}">
                  <Tables resources="${getPrivilegesTable('Resources', 'resources')}"/>
                </Group>                
                <Group name="Editors" visible="${getAttributeGroup('Editors', 'visible')}">
                  <Tables player_data="${getPrivilegesTable('Editors', 'player_data')}"/>
                </Group>
                <Group name="Catalog" visible="${getAttributeGroup('Catalog', 'visible')}">
                  <Tables catalog_items="${getPrivilegesTable('Catalog', 'catalog_items')}" catalog_item_infos="${getPrivilegesTable('Catalog', 'catalog_item_infos')}" catalog_item_resources="${getPrivilegesTable('Catalog', 'catalog_item_resources')}" catalog_item_categories="${getPrivilegesTable('Catalog', 'catalog_item_categories')}" category_values="${getPrivilegesTable('Catalog', 'category_values')}"/>
                </Group>
                <Group name="Campaigns" visible="${getAttributeGroup('Campaigns', 'visible')}">
                  <Tables campaigns="${getPrivilegesTable('Campaigns', 'campaigns')}" campaign_events="${getPrivilegesTable('Campaigns', 'campaign_events')}" campaign_timelines="${getPrivilegesTable('Campaigns', 'campaign_timelines')}" campaign_timeline_sequences="${getPrivilegesTable('Campaigns', 'campaign_timeline_sequences')}" campaign_timeline_schedules="${getPrivilegesTable('Campaigns', 'campaign_timeline_schedules')}" campaign_sequences="${getPrivilegesTable('Campaigns', 'campaign_sequences')}" campaign_sequence_timelines="${getPrivilegesTable('Campaigns', 'campaign_sequence_timelines')}" campaign_sequence_schedules="${getPrivilegesTable('Campaigns', 'campaign_sequence_schedules')}" campaign_timeline_channels="${getPrivilegesTable('Campaigns', 'campaign_timeline_channels')}" campaign_timeline_chanels="${getPrivilegesTable('Campaigns', 'campaign_timeline_chanels')}" campaign_timeline_chanel_players="${getPrivilegesTable('Campaigns', 'campaign_timeline_chanel_players')}" campaign_timeline_board_viewer_channels="${getPrivilegesTable('Campaigns', 'campaign_timeline_board_viewer_channels')}" campaign_timeline_board_viewer_chanels="${getPrivilegesTable('Campaigns', 'campaign_timeline_board_viewer_chanels')}" campaign_timeline_board_templates="${getPrivilegesTable('Campaigns', 'campaign_timeline_board_templates')}" campaign_channels="${getPrivilegesTable('Campaigns', 'campaign_channels')}" campaign_channel_players="${getPrivilegesTable('Campaigns', 'campaign_channel_players')}" campaign_boards="${getPrivilegesTable('Campaigns', 'campaign_boards')}"/>
                </Group>
                <Group name="Transitions" visible="${getAttributeGroup('Transitions', 'visible')}">
                  <Tables transition_pools="${getPrivilegesTable('Transitions', 'transition_pools')}" transition_pool_items="${getPrivilegesTable('Transitions', 'transition_pool_items')}"/>
                </Group>
                <Group name="Scripts" visible="${getAttributeGroup('Scripts', 'visible')}">
                  <Tables scripts="${getPrivilegesTable('Scripts', 'scripts')}"/>
                </Group>
                <Group name="AdNet" 
                    visible="${getAttributeGroup('AdNet', 'visible')}" 
                    profile="${getAttributeGroup('AdNet', 'profile')}"
                    customerNetwork="${getAttributeGroup('AdNet', 'customerNetwork')}"
                    resellerNetwork="${getAttributeGroup('AdNet', 'resellerNetwork')}"
                    globalNetwork="${getAttributeGroup('AdNet', 'globalNetwork')}"
                    defaultAutoActivate="${getAttributeGroup('AdNet', 'defaultAutoActivate')}"
                    pairFeedback="${getAttributeGroup('AdNet', 'pairFeedback')}"
                    pairSetting="${getAttributeGroup('AdNet', 'pairSetting')}"
                    pairChat="${getAttributeGroup('AdNet', 'pairChat')}"
                    billing="${getAttributeGroup('AdNet', 'billing')}"
                    assets="${getAttributeGroup('AdNet', 'assets')}"
                    >
                  <Tables 
                      adnet_rates="${getPrivilegesTable('AdNet', 'adnet_rates')}" 
                      adnet_targets="${getPrivilegesTable('AdNet', 'adnet_targets')}"
                      adnet_packages="${getPrivilegesTable('AdNet', 'adnet_packages')}"
                      adnet_package_contents="${getPrivilegesTable('AdNet', 'adnet_package_contents')}"
                      adnet_package_targets="${getPrivilegesTable('AdNet', 'adnet_package_targets')}"
                  />
                </Group>                
                <Group name="Music" visible="${getAttributeGroup('Music', 'visible')}">
                  <Tables 
                  music_channels="${getPrivilegesTable('Music', 'music_channels')}" 
                  music_channel_songs="${getPrivilegesTable('Music', 'music_channel_songs')}"/>
                </Group>
                <Group name="Stations"
                    visible="${getAttributeGroup('Stations', 'visible')}" 
                    stationsNetwork="${getAttributeGroup('Stations', 'stationsNetwork')}" 
                    updateOnSave="${getAttributeGroup('Stations', 'updateOnSave')}" 
                    lanServer="${getAttributeGroup('Stations', 'lanServer')}" 
                    zwave="${getAttributeGroup('Stations', 'zwave')}"
                  >
                  <Tables 
                    branch_stations="${getPrivilegesTable('Stations', 'branch_stations')}" 
                    station_ads="${getPrivilegesTable('Stations', 'station_ads')}"/>
                </Group>
                <Group name="Changelist" visible="${getAttributeGroup('Changelist', 'visible')}">
                  <Tables/>
                </Group>
              </Groups>
        </Privilege>
        `

        if (_.isNull(appStore)) {
            // mode 1: generate object from XML (we don't care about values as this is just a template)
            parseString(xmlData, {attrkey: '_attr'}, function (err, result) {
                callBack(err, result);
            });
        } else {
            // mode 2: generate raw XML with real user data from appStore so we can serialize and save to server
            callBack(null, xmlData);
        }

    }

    static Base64() {

        var _PADCHAR = "=", _ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", _VERSION = "1.0";


        function _getbyte64(s, i) {
            // This is oddly fast, except on Chrome/V8.
            // Minimal or no improvement in performance by using a
            // object with properties mapping chars to value (eg. 'A': 0)

            var idx = _ALPHA.indexOf(s.charAt(i));

            if (idx === -1) {
                throw "Cannot decode base64";
            }

            return idx;
        }


        function _decode(s) {
            var pads = 0, i, b10, imax = s.length, x = [];

            s = String(s);

            if (imax === 0) {
                return s;
            }

            if (imax % 4 !== 0) {
                throw "Cannot decode base64";
            }

            if (s.charAt(imax - 1) === _PADCHAR) {
                pads = 1;

                if (s.charAt(imax - 2) === _PADCHAR) {
                    pads = 2;
                }

                // either way, we want to ignore this last block
                imax -= 4;
            }

            for (i = 0; i < imax; i += 4) {
                b10 = ( _getbyte64(s, i) << 18 ) | ( _getbyte64(s, i + 1) << 12 ) | ( _getbyte64(s, i + 2) << 6 ) | _getbyte64(s, i + 3);
                x.push(String.fromCharCode(b10 >> 16, ( b10 >> 8 ) & 0xff, b10 & 0xff));
            }

            switch (pads) {
                case 1:
                    b10 = ( _getbyte64(s, i) << 18 ) | ( _getbyte64(s, i + 1) << 12 ) | ( _getbyte64(s, i + 2) << 6 );
                    x.push(String.fromCharCode(b10 >> 16, ( b10 >> 8 ) & 0xff));
                    break;

                case 2:
                    b10 = ( _getbyte64(s, i) << 18) | ( _getbyte64(s, i + 1) << 12 );
                    x.push(String.fromCharCode(b10 >> 16));
                    break;
            }

            return x.join("");
        }


        function _getbyte(s, i) {
            var x = s.charCodeAt(i);

            if (x > 255) {
                throw "INVALID_CHARACTER_ERR: DOM Exception 5";
            }

            return x;
        }


        function _encode(s) {
            if (arguments.length !== 1) {
                throw "SyntaxError: exactly one argument required";
            }

            s = String(s);

            var i, b10, x = [], imax = s.length - s.length % 3;

            if (s.length === 0) {
                return s;
            }

            for (i = 0; i < imax; i += 3) {
                b10 = ( _getbyte(s, i) << 16 ) | ( _getbyte(s, i + 1) << 8 ) | _getbyte(s, i + 2);
                x.push(_ALPHA.charAt(b10 >> 18));
                x.push(_ALPHA.charAt(( b10 >> 12 ) & 0x3F));
                x.push(_ALPHA.charAt(( b10 >> 6 ) & 0x3f));
                x.push(_ALPHA.charAt(b10 & 0x3f));
            }

            switch (s.length - imax) {
                case 1:
                    b10 = _getbyte(s, i) << 16;
                    x.push(_ALPHA.charAt(b10 >> 18) + _ALPHA.charAt(( b10 >> 12 ) & 0x3F) + _PADCHAR + _PADCHAR);
                    break;

                case 2:
                    b10 = ( _getbyte(s, i) << 16 ) | ( _getbyte(s, i + 1) << 8 );
                    x.push(_ALPHA.charAt(b10 >> 18) + _ALPHA.charAt(( b10 >> 12 ) & 0x3F) + _ALPHA.charAt(( b10 >> 6 ) & 0x3f) + _PADCHAR);
                    break;
            }

            return x.join("");
        }


        return {
            decode: _decode,
            encode: _encode,
            VERSION: _VERSION
        };
    }

    static AppsXmlTemplate(callBack: (err, result) => any) {
        // const parseString = require('xml2js').parseString;
        const parseString = xml2js.parseString;
        var xmlData = `
                <Apps>
                  <App id="10145" appName="Webkit" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Webkit</Description>
                    <Components>
                      <Component moduleId="3415" componentName="Webkit" version="1911" moduleWeb="Players/Standard/BlockWebkitPlayerWeb.swf" moduleAir="Players/Standard/BlockWebkitPlayerDesktop.swf" moduleMobile="Players/Standard/BlockWebkitPlayerMobile.swf" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="10500" appName="Label Queue" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Label Queue</Description>
                    <Components>
                      <Component moduleId="3242" componentName="LabelQueue" version="1911" moduleWeb="Players/Standard/BlockLabelQueuePlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="12100" appName="FasterQ" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>FasterQ</Description>
                    <Components>
                      <Component moduleId="6100" componentName="FasterQ" version="1911" moduleWeb="Players/Standard/BlockWebkitPlayerWeb.swf" moduleAir="Players/Standard/BlockWebkitPlayerDesktop.swf" moduleMobile="Players/Standard/BlockWebkitPlayerMobile.swf" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;http://galaxy.signage.me/code/html/fasterq.json&quot;}"/>
                    </Components>
                  </App>
                  <App id="12010" appName="World weather" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Weather</Description>
                    <Components>
                      <Component moduleId="6010" componentName="World weather" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com/Weather&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="weather" label="World weather"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="10140" appName="Ext Application" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Ext Application</Description>
                    <Components>
                      <Component moduleId="3410" componentName="Ext Application" version="1911" moduleWeb="Players/Standard/BlockExtAppPlayerWeb.swf" moduleAir="Players/Standard/BlockExtAppPlayerAir.swf" moduleMobile="" showInTimeline="1" showInScene="0"/>
                    </Components>
                  </App>
                  <App id="10050" appName="Rss Text" helpName="" uninstallable="0" hidden="0" price="0">
                    <Description>Rss Text</Description>
                    <Components>
                      <Component moduleId="3345" componentName="Rss Text" version="1911" moduleWeb="Players/Standard/BlockRssTextPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="10400" appName="Message" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Message</Description>
                    <Components>
                      <Component moduleId="3245" componentName="Message" version="1911" moduleWeb="Players/Standard/BlockMessagePlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="12090" appName="Pinterest" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Pinterest</Description>
                    <Components>
                      <Component moduleId="6080" componentName="Pinterest" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com/PinterestUserPins&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="pinterest.board" label="Pinterest board"/>
                          <MimeType name="Json" providerType="pinterest.user" label="Pinterest user"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="12000" appName="Digg" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Digg</Description>
                    <Components>
                      <Component moduleId="6000" componentName="Digg" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com/Digg&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="digg" label="Digg"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="10130" appName="Grid/Chart" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Grid/Chart</Description>
                    <Components>
                      <Component moduleId="3400" componentName="Grid/Chart" version="1911" moduleWeb="Players/Standard/BlockChartPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="10040" appName="Html" helpName="" uninstallable="0" hidden="0" price="0">
                    <Description>Html</Description>
                    <Components>
                      <Component moduleId="3235" componentName="Html" version="1911" moduleWeb="Players/Standard/BlockHtmlPlayerWeb.swf" moduleAir="Players/Standard/BlockHtmlPlayerAir.swf" moduleMobile="Players/Standard/BlockHtmlPlayerMobile.swf" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="12260" appName="Mashape" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Mashape</Description>
                    <Components>
                      <Component moduleId="6260" componentName="Mashape" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="mashape.randomQuote" label="Mashape movie quotes"/>
                          <MimeType name="Json" providerType="mashape.currency" label="Mashape currency exchange"/>
                          <MimeType name="Json" providerType="mashape.btc" label="Mashape bitcoin rate"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="12080" appName="500px" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>500px</Description>
                    <Components>
                      <Component moduleId="6070" componentName="500px" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com/500pxPhotos&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="500px.collection" label="500px collection"/>
                          <MimeType name="Json" providerType="500px.user" label="500px user"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="10210" appName="Twitter" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Twitter</Description>
                    <Components>
                      <Component moduleId="4505" componentName="Twitter Item" version="1911" moduleWeb="Players/Standard/BlockTwitterItemPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="0" showInScene="1"/>
                      <Component moduleId="4500" componentName="Twitter Player" version="1911" moduleWeb="Players/Standard/BlockTwitterPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="10120" appName="Clock" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Clock</Description>
                    <Components>
                      <Component moduleId="3320" componentName="Clock" version="1911" moduleWeb="Players/Standard/BlockClockPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="10030" appName="Label" helpName="" uninstallable="0" hidden="0" price="0">
                    <Description>Label</Description>
                    <Components>
                      <Component moduleId="3241" componentName="Label" version="1911" moduleWeb="Players/Standard/BlockLabelPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                      <Component moduleId="3240" componentName="RichText" version="1911" moduleWeb="Players/Standard/BlockRichTextPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="12250" appName="Etsy" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Etsy</Description>
                    <Components>
                      <Component moduleId="6250" componentName="Etsy" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="etsy.userProfile" label="Etsy user profile"/>
                          <MimeType name="Json" providerType="etsy.shopAbout" label="Etsy shop about"/>
                          <MimeType name="Json" providerType="etsy.shopListings" label="Etsy shop listings"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="12070" appName="Google drive" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Google drive</Description>
                    <Components>
                      <Component moduleId="6060" componentName="Google drive" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com/GoogleAjaxFileLink/&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="drive" label="Google drive"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="10220" appName="YouTube" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>YouTube</Description>
                    <Components>
                      <Component moduleId="4600" componentName="YouTube" version="1911" moduleWeb="Players/Standard/BlockYouTubePlayerWeb.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="11000" appName="Browser" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Browser</Description>
                    <Components>
                      <Component moduleId="5500" componentName="Browser" version="1911" moduleWeb="Players/Standard/BlockWebkitPlayerWeb.swf" moduleAir="Players/Standard/BlockWebkitPlayerDesktop.swf" moduleMobile="Players/Standard/BlockWebkitPlayerMobile.swf" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;http://galaxy.signage.me/code/html/browser.json&quot;}"/>
                    </Components>
                  </App>
                  <App id="10020" appName="External Resource" helpName="" uninstallable="0" hidden="0" price="0">
                    <Description>External Resource</Description>
                    <Components>
                      <Component moduleId="3160" componentName="External swf/image" version="1911" moduleWeb="Players/Standard/BlockLinkedSwfPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                      <Component moduleId="3150" componentName="External video" version="1911" moduleWeb="Players/Standard/BlockLinkedVideoPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="10195" appName="JSON Player" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>JSON Player</Description>
                    <Components>
                      <Component moduleId="4310" componentName="JsonItem" version="1911" moduleWeb="Players/Standard/BlockJsonItemPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="0" showInScene="1"/>
                      <Component moduleId="4300" componentName="JsonPlayer" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="12230" appName="Twitter" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Twitter</Description>
                    <Components>
                      <Component moduleId="6230" componentName="Twitter" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="twitter" label="Twitter"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="12240" appName="Yelp" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Yelp</Description>
                    <Components>
                      <Component moduleId="6240" componentName="Yelp" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="yelp.reviews" label="Yelp reviews"/>
                          <MimeType name="Json" providerType="yelp.info" label="Yelp info"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="12060" appName="Instagram" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Instagram</Description>
                    <Components>
                      <Component moduleId="6050" componentName="Instagram" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com/InstagramFeed&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="instagram.feed" label="Instagram feed"/>
                          <MimeType name="Json" providerType="instagram.media" label="Instagram media"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="10190" appName="XML Player" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>XML Player</Description>
                    <Components>
                      <Component moduleId="4210" componentName="XmlItem" version="1911" moduleWeb="Players/Standard/BlockXmlItemPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="0" showInScene="1"/>
                      <Component moduleId="4200" componentName="XmlPlayer" version="1911" moduleWeb="Players/Standard/BlockXmlPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="10100" appName="Catalog" helpName="" uninstallable="0" hidden="0" price="0">
                    <Description>Catalog</Description>
                    <Components>
                      <Component moduleId="3270" componentName="Catalog item" version="1911" moduleWeb="Players/Standard/BlockItemPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="0" showInScene="1"/>
                      <Component moduleId="3280" componentName="Catalog player" version="1911" moduleWeb="Players/Standard/BlockCatalogPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="0">
                        <MimeTypes>
                          <MimeType name="Catalog" label="Catalog"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="10010" appName="Scene" helpName="" uninstallable="0" hidden="1" price="0">
                    <Description>Scene</Description>
                    <Components>
                      <Component moduleId="3511" componentName="DesignerEditor" version="1911" moduleWeb="Players/Standard/DesignerEditor.swf" moduleAir="" moduleMobile="" showInTimeline="0" showInScene="0"/>
                      <Component moduleId="3510" componentName="DesignerPlayer" version="1911" moduleWeb="Players/Standard/DesignerPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="0" showInScene="0"/>
                    </Components>
                  </App>
                  <App id="12210" appName="Dropbox" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Dropbox</Description>
                    <Components>
                      <Component moduleId="6210" componentName="Dropbox" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="dropbox" label="Dropbox"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="10185" appName="Location based" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Location based</Description>
                    <Components>
                      <Component moduleId="4105" componentName="LocationBasedPlayer" version="1911" moduleWeb="Players/Standard/BlockLocationBasedPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="10005" appName="Embeded Resource" helpName="" uninstallable="0" hidden="1" price="0">
                    <Description>Embeded Resource</Description>
                    <Components>
                      <Component moduleId="3130" componentName="Swf" version="1911" moduleWeb="Players/Standard/BlockSwfPlayer.swf" moduleAir="Players/Standard/BlockSwfPlayerDesktop.swf" moduleMobile="Players/Standard/BlockSwfPlayerMobile.swf" showInTimeline="0" showInScene="0"/>
                      <Component moduleId="3140" componentName="Svg" version="1911" moduleWeb="Players/Standard/BlockSvgPlayer.swf" moduleAir="Players/Standard/BlockSvgPlayer.swf" moduleMobile="Players/Standard/BlockSvgPlayer.swf" showInTimeline="0" showInScene="0"/>
                      <Component moduleId="3100" componentName="Video" version="1911" moduleWeb="Players/Standard/VideoPlayer.swf" moduleAir="" moduleMobile="Players/Standard/BlockVideoPlayerMobile.swf" showInTimeline="0" showInScene="0"/>
                    </Components>
                  </App>
                  <App id="12050" appName="Picasa" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Picasa</Description>
                    <Components>
                      <Component moduleId="6040" componentName="Picasa" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com/GooglePicasa&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="picasa" label="Picasa"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="10180" appName="CollectionViewer" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>CollectionViewer</Description>
                    <Components>
                      <Component moduleId="4100" componentName="CollectionPlayer" version="1911" moduleWeb="Players/Standard/BlockCollectionPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="10090" appName="Stock" helpName="" uninstallable="0" hidden="0" price="0">
                    <Description>Stock</Description>
                    <Components>
                      <Component moduleId="3338" componentName="Stock player" version="1911" moduleWeb="Players/Standard/BlockStockTickerPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="0">
                        <MimeTypes>
                          <MimeType name="Stocks" label="Stocks"/>
                        </MimeTypes>
                      </Component>
                      <Component moduleId="3335" componentName="Stock item" version="1911" moduleWeb="Players/Standard/BlockStockItemPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="0" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="10122" appName="Countdown" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Countdown</Description>
                    <Components>
                      <Component moduleId="3322" componentName="Countdown" version="1911" moduleWeb="Players/Standard/BlockCountdownPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="10300" appName="Form" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Form</Description>
                    <Components>
                      <Component moduleId="3600" componentName="Form" version="1911" moduleWeb="Players/Standard/BlockFormPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="0" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="12220" appName="Flickr" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Flickr</Description>
                    <Components>
                      <Component moduleId="6220" componentName="Flickr" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="flickr" label="Flickr"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="12040" appName="Google plus" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Google plus</Description>
                    <Components>
                      <Component moduleId="6030" componentName="Google plus" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com/GooglePlusActivities&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="plus" label="Google plus"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="10080" appName="Weather" helpName="" uninstallable="0" hidden="0" price="0">
                    <Description>Weather</Description>
                    <Components>
                      <Component moduleId="3315" componentName="Weather item" version="1911" moduleWeb="Players/Standard/BlockItemWeatherPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="0" showInScene="1"/>
                      <Component moduleId="3310" componentName="Weather player" version="1911" moduleWeb="Players/Standard/BlockRssWeatherPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="0">
                        <MimeTypes>
                          <MimeType name="Weather" label="Weather"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="12032" appName="Google Sheets" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Google Sheets</Description>
                    <Components>
                      <Component moduleId="6022" componentName="Google Sheets" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com/GoogleSheetsValues&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="spreadsheet" label="Google Spreadsheet"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="12030" appName="Google calendar" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Google calendar</Description>
                    <Components>
                      <Component moduleId="6020" componentName="Google calendar" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com/GoogleCalendarEvents&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="calendar" label="Google calendar"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="10160" appName="QR Code" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>QR Code</Description>
                    <Components>
                      <Component moduleId="3430" componentName="QR Code" version="1911" moduleWeb="Players/Standard/BlockQRCodePlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="10070" appName="Media Rss/Podcast" helpName="" uninstallable="0" hidden="0" price="0">
                    <Description>Media Rss/Podcast</Description>
                    <Components>
                      <Component moduleId="3340" componentName="Media Rss/Podcast" version="1911" moduleWeb="Players/Standard/BlockRssVideoPlayerWeb.swf" moduleAir="Players/Standard/BlockRssVideoPlayerAir.swf" moduleMobile="" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="10110" appName="Capture/Camera" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Capture/Camera</Description>
                    <Components>
                      <Component moduleId="3350" componentName="Capture/Camera" version="1911" moduleWeb="Players/Standard/BlockCameraPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1"/>
                    </Components>
                  </App>
                  <App id="12200" appName="Tumblr" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Tumblr</Description>
                    <Components>
                      <Component moduleId="6090" componentName="Tumblr" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com/TumblrUserInfo&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="tumblr.texts" label="Tumblr texts"/>
                          <MimeType name="Json" providerType="tumblr.photos" label="Tumblr photos"/>
                          <MimeType name="Json" providerType="tumblr.videos" label="Tumblr videos"/>
                          <MimeType name="Json" providerType="tumblr.posts" label="Tumblr posts"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="12020" appName="Facebook" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>Facebook</Description>
                    <Components>
                      <Component moduleId="4400" componentName="Facebook" version="1911" moduleWeb="Players/Standard/BlockJsonPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="1" componentParams="{&quot;url&quot;:&quot;https://secure.digitalsignage.com/facebook&quot;}">
                        <MimeTypes>
                          <MimeType name="Json" providerType="facebook.videos" label="Facebook videos"/>
                          <MimeType name="Json" providerType="facebook.wall" label="Facebook wall"/>
                          <MimeType name="Json" providerType="facebook.album" label="Facebook album"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                  <App id="10150" appName="AdNet" helpName="" uninstallable="1" hidden="0" price="0">
                    <Description>AdNet</Description>
                    <Components>
                      <Component moduleId="3420" componentName="AdNet" version="1911" moduleWeb="Players/Standard/BlockAdNetPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="0"/>
                    </Components>
                  </App>
                  <App id="10060" appName="Custom Rss" helpName="" uninstallable="0" hidden="0" price="0">
                    <Description>Custom Rss</Description>
                    <Components>
                      <Component moduleId="3348" componentName="Custom Rss item" version="1911" moduleWeb="Players/Standard/BlockCustomRssItemPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="0" showInScene="1"/>
                      <Component moduleId="3346" componentName="Custom Rss player" version="1911" moduleWeb="Players/Standard/BlockCustomRssPlayer.swf" moduleAir="" moduleMobile="" showInTimeline="1" showInScene="0">
                        <MimeTypes>
                          <MimeType name="CustomRss" label="CustomRss"/>
                        </MimeTypes>
                      </Component>
                    </Components>
                  </App>
                </Apps>
        `

        parseString(xmlData, {attrkey: '_attr'}, function (err, result) {
            callBack(err, result);
        });
    }

    // static LoadComponentAsync(name: string, path: string) {
    //
    //     return System.import(path).then(c => c[name]);
    //
    //     //return System.import('/dist/public/out.js')
    //     //    .catch(function (e) {
    //     //        alert('prob loading out.js ' + e);
    //     //    }).then(function (e) {
    //     //        alert(e);
    //     //        alert(e[name]);
    //     //        alert(JSON.stringify(e));
    //     //        return System.import('App1').then(c => c[name]);
    //     //    });
    // }


    static ConstructImmutableFromTable(path): Array<any> {
        var arr = [];
        path.forEach((member) => {
            var obj = {};
            obj[member._attr.name] = {
                table: {}
            }
            for (var k in member._attr) {
                var value = member._attr[k]
                obj[member._attr.name][k] = value;
                for (var t in member.Tables["0"]._attr) {
                    var value = member.Tables["0"]._attr[t]
                    obj[member._attr.name]['table'][t] = value;
                }
            }
            arr.push(Immutable.fromJS(obj));
        });
        return arr;
    }

    static ComputeMask(accessMask): number {
        var bits = [1, 2, 4, 8, 16, 32, 64, 128];
        var computedAccessMask = 0;
        accessMask.forEach(value => {
            var bit = bits.shift();
            if (value) computedAccessMask = computedAccessMask + bit;

        })
        return computedAccessMask;
    }

    static GetAccessMask(accessMask): List<any> {
        var checks = List();
        var bits = [1, 2, 4, 8, 16, 32, 64, 128];
        for (var i = 0; i < bits.length; i++) {
            let checked = (bits[i] & accessMask) > 0 ? true : false;
            checks = checks.push(checked)
        }
        return checks;
    }

    static GetADaysMask(accessMask): List<any> {
        var checks = List();
        var bits = [1, 2, 4, 8, 16, 32, 64];
        for (var i = 0; i < bits.length; i++) {
            let checked = (bits[i] & accessMask) > 0 ? true : false;
            checks = checks.push(checked)
        }
        return checks;
    }

    static log(msg) {
        console.log(new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") + ': ' + msg);
    }

    static guid(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    static ReduxLoggerMiddleware = store => next => action => {
        // console.log("dispatching", action.type);
        let result = next(action);
        //console.log("next state", store.getState());
        return result
    };

    static DevMode(): boolean {
        if (window.location.href.indexOf('localhost') > -1) {
            return true;
        } else {
            return false;
        }
    }

    static GetSamples(): Object {
        return {
            1019: 'Sushi Restaurant,pro',
            1029: 'food menu board,pro',
            1007: 'Home and Garden,pro',
            1009: 'Hotel Lobby,pro',
            1016: 'Coffee Shop,pro',
            1011: 'Hobby Shop,pro',
            1013: 'Sports Bar,pro',
            1014: 'Museum,pro',
            1017: 'Bank,pro',
            1018: 'Gas Station,pro',
            1020: 'Casino,pro',
            1000: 'Travel,pro',
            1021: 'Bicycle Shop,pro',
            1022: 'Tanning Salon,pro',
            1023: 'Pharmacy,pro',
            1024: 'Laser Away,pro',
            1025: 'Dentistry,pro',
            1026: 'Clothing store,pro',
            1027: 'Golf club,pro',
            1028: 'RC Heli,pro',
            1030: 'seven eleven,pro',
            1031: 'Subway,pro',
            1032: 'Super market,pro',
            1033: 'Investment Group,pro',
            1035: 'Synagogue,pro',
            1036: 'Dry Cleaning,pro',
            1037: 'Ice Cream Shop,pro',
            1038: 'Real Estate office,pro',
            1039: 'Night Club,pro',
            1040: 'Hockey,pro',
            1041: 'Train Station,pro',
            1042: 'Realtor,pro',
            1043: 'Toy Store,pro',
            1044: 'Indian Restaurant,pro',
            1045: 'Library,pro',
            1046: 'Movie Theater,pro',
            1047: 'Airport,pro',
            1048: 'LAX,pro',
            100310: 'Motel,pro',
            100301: 'Parks and Recreations,pro',
            100322: 'Corner Bakery,pro',
            100331: 'Retirement home,pro',
            100368: 'Navy recruiting office,pro',
            100397: 'Martial arts school,pro',
            100414: 'Supercuts,pro',
            100432: 'The UPS Store,pro',
            100438: 'Cruise One,pro',
            100483: 'Car service,pro',
            100503: 'fedex kinkos,pro',
            100510: 'veterinarian,pro',
            100556: 'YMCA,pro',
            100574: 'Tax services,pro',
            100589: 'Wedding planner,pro',
            100590: 'Cleaning services,pro',
            100620: 'Pet Training,pro',
            100661: 'Gymboree Kids,pro',
            100677: 'Trader Joes,pro',
            100695: 'Men Haircuts,pro',
            100722: 'Jiffy Lube,pro',
            100738: 'Toyota  car dealer,pro',
            100747: 'Winery,pro',
            100771: 'Savings and Loans,pro',
            100805: 'Nail Salon,pro',
            100822: 'Weight Watchers,pro',
            100899: 'Dollar Tree,pro',
            100938: 'Western Bagles,pro',
            100959: 'Kaiser Permanente,pro',
            300143: 'Funeral home,pro',
            205734: 'Church,pro',
            220354: 'College,pro',
            206782: 'Dr Waiting Room,pro',
            300769: 'NFL Stadium,pro',
            301814: 'University Campus,pro',
            303038: 'Day care,pro',
            304430: 'GameStop,pro',
            307713: 'Del Taco,pro',
            305333: 'General Hospital,pro',
            305206: 'Starbucks,pro',
            308283: 'training and fitness,pro',
            311519: 'High school hall,pro',
            309365: 'Winery,pro',
            310879: 'Law Firm,pro',
            1001: 'Health Club,pro',
            1002: 'Gym,pro',
            1003: 'Flower Shop,pro',
            1004: 'Car Dealership,pro',
            1012: 'Pet Shop,pro',
            1005: 'Hair Salon,pro',
            1209: 'Motorcycle shop,lite',
            1210: 'Sushi and Grill,lite',
            1211: 'the Coffee Shop,lite',
            1212: 'Pizzeria,lite',
            1213: 'Music Store,lite',
            1214: 'Diner,lite',
            1215: 'the Hair Salon,lite',
            1216: 'Dentist,lite',
            1203: 'Jewelry,lite',
            1217: 'Crossfit,lite',
            1218: 'Copy and Print shop,lite',
            1219: 'Antique Store,lite',
            1220: 'Clock Repair Store,lite',
            1221: 'Eastern Cuisine,lite',
            1222: 'the Toy Store,lite',
            1223: 'Pet Store Grooming,lite',
            1224: 'the Veterinarian,lite',
            1225: 'Tattoo Parlor,lite',
            1226: 'Camera Store,lite',
            1228: 'Bike shop,lite',
            1229: 'Gun Shop,lite',
            1230: 'Chiropractic Clinic,lite',
            1231: 'French Restaurant,lite',
            1233: 'Winery,lite',
            1232: 'Mexican Taqueria,lite',
            1234: 'Bistro Restaurant,lite',
            1235: 'Vitamin Shop,lite',
            1227: 'Tailor Shop,lite',
            1236: 'Computer Repair,lite',
            1237: 'Car Detail,lite',
            1238: 'Asian Restaurants,lite',
            1239: 'Marijuana Dispensary,lite',
            1240: 'the Church,lite',
            1241: 'Synagogue,lite',
            1242: 'Frozen Yogurt Store,lite',
            1244: 'Baby Day Care,lite',
            1052: 'Car wash,lite',
            1053: 'Smoke shop,lite',
            1054: 'Yoga place,lite',
            1055: 'Laundromat,lite',
            1056: 'Baby clothes,lite',
            1057: 'Travel agency,lite',
            1058: 'Real Estate agent,lite'
        }
    }

    static Xml2Json() {
        //https://github.com/metatribal/xmlToJSON
        var xmlToJSON = (function () {

            this.version = "1.3";

            var options = { // set up the default options
                mergeCDATA: true, // extract cdata and merge with text
                grokAttr: true, // convert truthy attributes to boolean, etc
                grokText: true, // convert truthy text/attr to boolean, etc
                normalize: true, // collapse multiple spaces to single space
                xmlns: true, // include namespaces as attribute in output
                namespaceKey: '_ns', // tag name for namespace objects
                textKey: '_text', // tag name for text nodes
                valueKey: '_value', // tag name for attribute values
                attrKey: '_attr', // tag for attr groups
                cdataKey: '_cdata', // tag for cdata nodes (ignored if mergeCDATA is true)
                attrsAsObject: true, // if false, key is used as prefix to name, set prefix to '' to merge children and attrs.
                stripAttrPrefix: true, // remove namespace prefixes from attributes
                stripElemPrefix: true, // for elements of same name in diff namespaces, you can enable namespaces and access the nskey property
                childrenAsArray: true // force children into arrays
            };

            var prefixMatch: any = new RegExp('(?!xmlns)^.*:/');
            var trimMatch: any = new RegExp('^\s+|\s+$g');

            this.grokType = function (sValue) {
                if (/^\s*$/.test(sValue)) {
                    return null;
                }
                if (/^(?:true|false)$/i.test(sValue)) {
                    return sValue.toLowerCase() === "true";
                }
                if (isFinite(sValue)) {
                    return parseFloat(sValue);
                }
                return sValue;
            };

            this.parseString = function (xmlString, opt) {
                return this.parseXML(this.stringToXML(xmlString), opt);
            }

            this.parseXML = function (oXMLParent, opt) {

                // initialize options
                for (var key in opt) {
                    options[key] = opt[key];
                }

                var vResult = {}, nLength = 0, sCollectedTxt = "";

                // parse namespace information
                if (options.xmlns && oXMLParent.namespaceURI) {
                    vResult[options.namespaceKey] = oXMLParent.namespaceURI;
                }

                // parse attributes
                // using attributes property instead of hasAttributes method to support older browsers
                if (oXMLParent.attributes && oXMLParent.attributes.length > 0) {
                    var vAttribs = {};

                    for (nLength; nLength < oXMLParent.attributes.length; nLength++) {
                        var oAttrib = oXMLParent.attributes.item(nLength);
                        vContent = {};
                        var attribName = '';

                        if (options.stripAttrPrefix) {
                            attribName = oAttrib.name.replace(prefixMatch, '');

                        } else {
                            attribName = oAttrib.name;
                        }

                        if (options.grokAttr) {
                            vContent[options.valueKey] = this.grokType(oAttrib.value.replace(trimMatch, ''));
                        } else {
                            vContent[options.valueKey] = oAttrib.value.replace(trimMatch, '');
                        }

                        if (options.xmlns && oAttrib.namespaceURI) {
                            vContent[options.namespaceKey] = oAttrib.namespaceURI;
                        }

                        if (options.attrsAsObject) { // attributes with same local name must enable prefixes
                            vAttribs[attribName] = vContent;
                        } else {
                            vResult[options.attrKey + attribName] = vContent;
                        }
                    }

                    if (options.attrsAsObject) {
                        vResult[options.attrKey] = vAttribs;
                    } else {
                    }
                }

                // iterate over the children
                if (oXMLParent.hasChildNodes()) {
                    for (var oNode, sProp, vContent, nItem = 0; nItem < oXMLParent.childNodes.length; nItem++) {
                        oNode = oXMLParent.childNodes.item(nItem);

                        if (oNode.nodeType === 4) {
                            if (options.mergeCDATA) {
                                sCollectedTxt += oNode.nodeValue;
                            } else {
                                if (vResult.hasOwnProperty(options.cdataKey)) {
                                    if (vResult[options.cdataKey].constructor !== Array) {
                                        vResult[options.cdataKey] = [vResult[options.cdataKey]];
                                    }
                                    vResult[options.cdataKey].push(oNode.nodeValue);

                                } else {
                                    if (options.childrenAsArray) {
                                        vResult[options.cdataKey] = [];
                                        vResult[options.cdataKey].push(oNode.nodeValue);
                                    } else {
                                        vResult[options.cdataKey] = oNode.nodeValue;
                                    }
                                }
                            }
                        } /* nodeType is "CDATASection" (4) */ else if (oNode.nodeType === 3) {
                            sCollectedTxt += oNode.nodeValue;
                        } /* nodeType is "Text" (3) */ else if (oNode.nodeType === 1) { /* nodeType is "Element" (1) */

                            if (nLength === 0) {
                                vResult = {};
                            }

                            // using nodeName to support browser (IE) implementation with no 'localName' property
                            if (options.stripElemPrefix) {
                                sProp = oNode.nodeName.replace(prefixMatch, '');
                            } else {
                                sProp = oNode.nodeName;
                            }

                            vContent = xmlToJSON.parseXML(oNode);

                            if (vResult.hasOwnProperty(sProp)) {
                                if (vResult[sProp].constructor !== Array) {
                                    vResult[sProp] = [vResult[sProp]];
                                }
                                vResult[sProp].push(vContent);

                            } else {
                                if (options.childrenAsArray) {
                                    vResult[sProp] = [];
                                    vResult[sProp].push(vContent);
                                } else {
                                    vResult[sProp] = vContent;
                                }
                                nLength++;
                            }
                        }
                    }
                } else if (!sCollectedTxt) { // no children and no text, return null
                    if (options.childrenAsArray) {
                        vResult[options.textKey] = [];
                        vResult[options.textKey].push(null);
                    } else {
                        vResult[options.textKey] = null;
                    }
                }

                if (sCollectedTxt) {
                    if (options.grokText) {
                        var value = this.grokType(sCollectedTxt.replace(trimMatch, ''));
                        if (value !== null && value !== undefined) {
                            vResult[options.textKey] = value;
                        }
                    } else if (options.normalize) {
                        vResult[options.textKey] = sCollectedTxt.replace(trimMatch, '').replace(/\s+/g, " ");
                    } else {
                        vResult[options.textKey] = sCollectedTxt.replace(trimMatch, '');
                    }
                }

                return vResult;
            }


            // Convert xmlDocument to a string
            // Returns null on failure
            this.xmlToString = function (xmlDoc) {
                try {
                    var xmlString = xmlDoc.xml ? xmlDoc.xml : (new XMLSerializer()).serializeToString(xmlDoc);
                    return xmlString;
                } catch (err) {
                    return null;
                }
            }

            // Convert a string to XML Node Structure
            // Returns null on failure
            this.stringToXML = function (xmlString) {
                try {
                    var xmlDoc = null;

                    if (window['DOMParser']) {

                        var parser = new DOMParser();
                        xmlDoc = parser.parseFromString(xmlString, "text/xml");

                        return xmlDoc;
                    } else {
                        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                        xmlDoc.async = false;
                        xmlDoc.loadXML(xmlString);

                        return xmlDoc;
                    }
                } catch (e) {
                    return null;
                }
            }

            return this;
        }).call({});
        return xmlToJSON;
    }


}


/* tslint:disable */
// polyfill for Object.assign (not part of TS yet)
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (!Object.assign) {
    Object.defineProperty(Object, "assign", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target) {
            "use strict";
            if (target === undefined || target === null) {
                throw new TypeError("Cannot convert first argument to object");
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(nextSource);
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
    });
}

// window['StringJS'] = ss.default;
// MyS.prototype = StringJS('')
// MyS.prototype.constructor = MyS;
// function MyS(val) {
//     this.setValue(val);
// }
//
// var formatMoney = function(n, c, d, t){
//     var c = isNaN(c = Math.abs(c)) ? 2 : c,
//         d = d == undefined ? "." : d,
//         t = t == undefined ? "," : t,
//         s = n < 0 ? "-" : "",
//         i:any = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
//         j = (j = i.length) > 3 ? j % 3 : 0;
//     return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
// };
//
// MyS.prototype.isBlank = function () {
//     var value = this.s;
//     if (_.isNaN(value))
//         return true;
//     if (_.isUndefined(value))
//         return true;
//     if (_.isNull(value))
//         return true;
//     if (_.isEmpty(String(value)))
//         return true;
//     return false;
// }
//
// MyS.prototype.isNotBlank = function () {
//     var value = this.s;
//     if (_.isNaN(value))
//         return false;
//     if (_.isUndefined(value))
//         return false;
//     if (_.isNull(value))
//         return false;
//     if (_.isEmpty(String(value)))
//         return false;
//     return true;
// }
//
// /**
//  *  booleanToNumber
//  *  convert boolean to a number 0 or 1
//  *  if forceCast is true, it will always return a number, else it will alow strings to pass through it
//  * @param forceCast
//  * @returns {any}
//  */
// MyS.prototype.booleanToNumber = function (forceCasting: boolean = false) {
//     var value = this.s;
//     if (value == '')
//         return 0;
//     if (_.isUndefined(value) || _.isNull(value) || value == 'NaN' || value == 'null' || value == 'NULL')
//         return 0;
//     if (value === "0" || value === 'false' || value === "False" || value === false)
//         return 0;
//     if (value === 1 || value === "true" || value === "True" || value === true)
//         return 1;
//     if (forceCasting) {
//         return parseInt(value);
//     } else {
//         return value;
//     }
// }
//
// MyS.prototype.toCurrency = function (format?: 'us'|'eu') {
//
//     var value = StringJS(this.s).toFloat(2);
//     if (_.isNaN(value))
//         value = 0;
//     switch (format) {
//         case 'eu': {
//             return '€' + formatMoney(value, 2, '.', ',');
//         }
//         case 'us': {}
//         default: {
//             return '$' + formatMoney(value, 2, '.', ',');
//         }
//     }
// }
//
// MyS.prototype.toPercent = function () {
//     return StringJS(this.s).toFloat(2) + '%';
// }
//
// MyS.prototype.fileTailName = function (i_level) {
//     var fileName = this.s;
//     var arr = fileName.split('/');
//     var size = arr.length;
//     var c = arr.slice(0 - i_level, size)
//     return new this.constructor(c.join('/'));
// }
//
// MyS.prototype.cleanChar = function () {
//     var value = this.s;
//     if (_.isUndefined(value))
//         return '';
//     if (_.isNull(value))
//         return '';
//     if (_.isNumber(value))
//         return value;
//     if (_.isBoolean(value))
//         return value;
//     value = value.replace(/\}/g, ' ');
//     value = value.replace(/%/g, ' ');
//     value = value.replace(/{/g, ' ');
//     value = value.replace(/"/g, '`');
//     value = value.replace(/'/g, '`');
//     value = value.replace(/&/g, 'and');
//     value = value.replace(/>/g, ' ');
//     value = value.replace(/</g, ' ');
//     value = value.replace(/\[/g, ' ');
//     value = value.replace(/]/g, ' ');
//     value = value.replace(/#/g, ' ');
//     value = value.replace(/\$/g, ' ');
//     value = value.replace(/\^/g, ' ');
//     value = value.replace(/;/g, ' ');
//     return value;
// }
//
// window['StringJS'] = function (str) {
//     if (_.isNull(str) || _.isUndefined(str))
//         str = '';
//     return new MyS(str);
// }