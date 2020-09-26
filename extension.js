/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */
const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Soup = imports.gi.Soup;

let label;
let _timeout;
let currency_code = "USD"
let endpoint = "https://www.nbrb.by/api/exrates/rates/" + currency_code + "?parammode=2"

function _refresh() {
    _getRate(endpoint);
    _removeTimeout();
    _timeout = Mainloop.timeout_add_seconds(3600, _refresh);
    return true;

}

function _refreshUI(data) {
    let txt = data.Cur_OfficialRate.toString();
    label.set_text(currency_code +": " + txt);
}

function _removeTimeout() {
    if (_timeout) {
        Mainloop.source_remove(_timeout);
        _timeout = null;
    }
}

function _getRate(url) {
    let session = new Soup.SessionAsync();
	Soup.Session.prototype.add_feature.call(session, new Soup.ProxyResolverDefault());
	let request = Soup.Message.new ("GET", url);
    session.queue_message (request, (source, message) => {
        if (message.status_code == 200) {
            let json = JSON.parse(message.response_body.data);
            _refreshUI(json); 
        }
	});
}

function init() {
}

function enable() {
    label = new St.Label({ text: "Pulling rates...", y_align: Clutter.ActorAlign.CENTER, style_class: "belarus-rates" });
    Main.panel._centerBox.add_child(label);
    _refresh();
}

function disable() {
    if (_timeout) {
        Mainloop.source_remove(_timeout);
        _timeout = null;
    }
    Main.panel._centerBox.remove_child(label);
}
