/// <reference path="../test-types.ts"/>

import * as _ from 'lodash';
import assert = require('../utils/ty-assert');
import server = require('../utils/server');
import utils = require('../utils/utils');
import { TyE2eTestBrowser } from '../utils/pages-for';
import settings = require('../utils/settings');
import make = require('../utils/make');
import logAndDie = require('../utils/log-and-die');
import c = require('../test-constants');

let browser: TyE2eTestBrowser;

let everyone;
let owen;
let owensBrowser: TyE2eTestBrowser;
let maria;
let mariasBrowser: TyE2eTestBrowser;

let idAddress: IdAddress;
let forumTitle = "Editor Onebox Forum";
let tweetTopicTitle = "Tweet Topic Title";

let dotOneboxClass = '.onebox';



const brokenPreview = '.s_LnPv-Err';
const tweetPrevwOk  = `.s_LnPv-Twitter:not(${brokenPreview})`;
const tweetPrevwError = `.s_LnPv-Twitter${brokenPreview}`;


describe("editor onebox:", () => {

  it("initialize people", () => {
    browser = new TyE2eTestBrowser(wdioBrowser);
    everyone = browser;
    owen = make.memberOwenOwner();
    owensBrowser = browser;
    maria = make.memberMaria();
    mariasBrowser = browser;
  });

  it("import a site", () => {
    let site: SiteData = make.forumOwnedByOwen('editor-onebox', { title: forumTitle });
    site.settings.allowGuestLogin = true;
    site.settings.requireVerifiedEmail = false;
    site.members.push(maria);
    idAddress = server.importSiteData(site);
  });

  it("Owen goes to the homepage and logs in", () => {
    owensBrowser.go2(idAddress.origin);
    owensBrowser.assertPageTitleMatches(forumTitle);
    owensBrowser.complex.loginWithPasswordViaTopbar(owen);
  });

  it("Owen opens the create-topic editor", () => {
    owensBrowser.forumButtons.clickCreateTopic();
  });

  it("Owen types a title", () => {
    owensBrowser.editor.editTitle(tweetTopicTitle);
  });


  // ----- Tweet preview in Editor

  it("... and a Twitter tweet link", () => {
    owensBrowser.editor.editText(
          'https://twitter.com/jacindaardern/status/1057100751955222530');
          // 'https://twitter.com/jacindaardern/status/1106397870628847617'
  });

  it("The tweet link becomes a Twitter Tweet Preview iframe", () => {
    // Something in here timed out once. So do in two steps, simpler to troubleshoot. First: ...
    owensBrowser.preview.waitForExist(tweetPrevwOk, { where: 'InEditor' });
  });


  // ----- Broken tweet

  it("... there's no broken tweet", () => {
    // Test the test:
    assert.ok(owensBrowser.preview.exists(tweetPrevwOk, { where: 'InEditor' }));
    // The real test:
    assert.not(owensBrowser.preview.exists(tweetPrevwError, { where: 'InEditor' }));
  });

  it("Owen types a broken tweet link", () => {
    owensBrowser.editor.editText('\n\n' +
          // Seems the username can be whatever — only the tweet nuumber matters.
          // But there aren't 9999... tweets yet.
          'https://twitter.com/someusername/status/9999999999999991234',
          { append: true });
  });

  it("That tweet becomes a 'Tweet not found' message", () => {
    owensBrowser.preview.waitForExist(tweetPrevwError, { where: 'InEditor' });
  });

  it("The ok tweet is still there", () => {
    owensBrowser.preview.waitForExist(tweetPrevwOk, { where: 'InEditor' });
  });


  // ----- Tweets in real topic

  it("Owen saves the page", () => {
    owensBrowser.rememberCurrentUrl();
    owensBrowser.editor.save();
    owensBrowser.waitForNewUrl();
    owensBrowser.assertPageTitleMatches(tweetTopicTitle);
  });

  it("The tweet appears in the new topic", () => {
    owensBrowser.topic.waitForExistsInPost(c.BodyNr, tweetPrevwOk);
  });

  it("... and the broken tweet too", () => {
    owensBrowser.topic.waitForExistsInPost(c.BodyNr, tweetPrevwError);
  });

  it("The editor and the in-editor previews, are gone", () => {
    assert.not(owensBrowser.preview.exists(tweetPrevwOk, { where: 'InEditor' }));
    assert.not(owensBrowser.preview.exists(tweetPrevwError, { where: 'InEditor' }));
  });


  // ----- In Page tweet previews

  it("Owen edits the page", () => {
    owensBrowser.topic.clickEditOrigPost();
  });

  it("... now the broken tween preview appears in the page", () => {
    owensBrowser.preview.waitForExist(tweetPrevwError, { where: 'InPage' });
  });

  it("... and the ok tweet preview too", () => {
    owensBrowser.preview.waitForExist(tweetPrevwOk, { where: 'InPage' });
  });


  // ----- Tweet previews in Maximized editor

  it("Owen maximizes the editor", () => {
    owensBrowser.waitAndClick('.esEdtr_cycleMaxHzBtn');
  });

  it("... an in-editor preview appears, for the Ok tweet", () => {
    owensBrowser.preview.waitForExist(tweetPrevwOk, { where: 'InEditor' });
  });

  it("... and for the broken tweet", () => {
    owensBrowser.preview.waitForExist(tweetPrevwError, { where: 'InEditor' });
  });

  it("Owen tiles the editor horizontally", () => {
owensBrowser.debug();
    owensBrowser.waitAndClick('.esEdtr_cycleMaxHzBtn');
  });

  it("... the in-editor Ok tweet preview is still there", () => {
    owensBrowser.preview.waitForExist(tweetPrevwOk, { where: 'InEditor' });
  });

  it("... and the broken tweet preview too", () => {
    owensBrowser.preview.waitForExist(tweetPrevwError, { where: 'InEditor' });
  });


  // ----- Two tweets

  it("Owen adds text and a 2nd not-broken tweet", () => {
    /// Ooops this once appended in the middle of the text :- (
    owensBrowser.editor.editText('\n\n' +
          'Wow_wow!\n\n' +
          'https://twitter.com/GreatOzGovTweet/status/707747970695962624',
          { append: true });

    owensBrowser.preview.waitForExist(tweetPrevwOk, { where: 'InEditor', howMany: 2 });
  });

  it("... saves", () => {
owensBrowser.debug();
    owensBrowser.editor.save();
  });

  it("The new text appears in the page", () => {
    owensBrowser.topic.waitForPostAssertTextMatches(c.BodyNr, "Wow_wow");
  });

  it("... The two ok tweets appear", () => {
    owensBrowser.topic.waitForExistsInPost(c.BodyNr, tweetPrevwOk, { howMany: 2 });
  });

  it("... and the broken tweet too", () => {
    owensBrowser.topic.waitForExistsInPost(c.BodyNr, tweetPrevwError);
  });

});

