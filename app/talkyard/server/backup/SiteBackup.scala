/**
 * Copyright (c) 2015-2019 Kaj Magnus Lindberg
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package talkyard.server.backup

import com.debiki.core._
import com.debiki.core.Prelude._


/** Later: This class should not contain complete items like Category an Post.
  * Instead, it should consist of CategoryToSave (exist) and PostToSave
  * (doesn't exist) and PageMetaToSave etc, where some fields can be left out.
  * That'd be useful if one wants to upsert something and overwrite only
  * some fields, and leave the others unchanged.
  *
  * So, all things need two representations: Thing and ThingPatch.
  * Don't do this until people actually ask for this.
  *
  * Also, these ThingPatch should be able to refer to each other via
  * external ids, in a patch, so the Talkyard clients won't need to
  * construct these patch > 2e9 "temporary import ids" — or "patch item id" ?
  *
  */
case class SiteBackup(  // RENAME to SiteDmup *no* SitePatch, and all related classes too.
                        // SitePatch is a (possibly small) set of changes to do to a site,
                        // whilst a SiteDump is a SitePatch that includes the whole site.
  site: Option[SiteInclDetails],
  settings: Option[SettingsToSave],
  summaryEmailIntervalMins: Int, // for now [7FKB4Q1]
  summaryEmailIfActive: Boolean, // for now [7FKB4Q1]
  guests: Seq[Guest],
  guestEmailNotfPrefs: Map[String, EmailNotfPrefs],
  users: Seq[UserInclDetails],
  categories: Seq[Category],
  pages: Seq[PageMeta],
  pagePaths: Seq[PagePathWithId],
  posts: Seq[Post],
  permsOnPages: Seq[PermsOnPages]) {

  def theSite: SiteInclDetails = site.getOrDie("TyE053KKPSA6")
}


case object SiteBackup {
  val empty = SiteBackup(
    site = None,
    settings = None,
    summaryEmailIntervalMins = 60, // for now [7FKB4Q1]
    summaryEmailIfActive = false, // for now [7FKB4Q1]
    guests = Vector.empty,
    guestEmailNotfPrefs = Map.empty,
    users = Vector.empty,
    pages = Vector.empty,
    pagePaths = Vector.empty,
    categories = Vector.empty,
    posts = Vector.empty,
    permsOnPages = Vector.empty)
}
