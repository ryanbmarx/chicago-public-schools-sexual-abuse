# -*- coding: utf-8 -*-

"""
Tarbell project configuration
"""

from flask import Blueprint, g, render_template
# import os.path # for testing for images
import jinja2 #for context-getting

from itertools import ifilter # For the route
from tarbell.hooks import register_hook #for the route, too


import sys
from os import path
sys.path.append( path.dirname( path.abspath(__file__) ) )
import archie

######### Specifically for the ArchieML

import htmlmin # to minify html

import codecs, archieml
from subprocess import call
from apiclient import errors

# imports bc copied blueprint functions #
from clint.textui import colored
# import p2p
from tarbell.utils import puts
from tarbell.oauth import get_drive_api

# To generate the urls with or without links
from flask_frozen import Freezer, walk_directory

# For the sidebar keyword search/replace
import re

# Google document key for the stories. If not specified, the Archie stuff is skipped
DOC_KEY = "1NNNFdLZvKiSzG3t2NJ0Ls4YIGPaSq1oM5QhiMd-bYFM"

# Google spreadsheet key
SPREADSHEET_KEY = "1SQ_N8fyaimSvjMs62HyATD1CsnssDD7fVWKp14Ta7eQ"


blueprint = Blueprint('cps_abuse', __name__)

# This is so we don't need to make physical html files for each one. 

@blueprint.route('/<slug>/index.html')
@blueprint.route('/<slug>')
@blueprint.route('/<slug>/')
def cps_abuse_story(slug):
    """
    Make a page for each bar (side or main), based on the unique slug.
    """
    site = g.current_site

    # We'll use the slug to find only the archie stuff we want, then pass that to the template
    # archie.get_drive_api_stuff(site, site.project.DOC_KEY)
    
    # try:
    #     archie_content = archie.get_extra_context()
    #     story = archie_content['abuse'][slug]
    # except KeyError:
    #     story = "No story content"



    # get our production bucket for URL building
    bucket = site.project.S3_BUCKETS.get('production', '')
    data = site.get_context()
    rows = data.get('stories', [])

    # get the row we want, defaulting to an empty dictionary
    row = next(ifilter(lambda r: r['slug'] == slug, rows), {})

    print "fetching content for {}".format(slug)

    if row != {} and row['slug'] != data[mainbar_slug]: 
        # render a template, using the same template environment as everywhere else
        # But skip the mainbar, since that is the main index.html
        return render_template('templates/_abuse-sidebar-base.html', bucket=bucket, slug=slug, story_info=row,**data)
    elif slug == "404.html":
        return render_template('404.html', bucket=bucket,**data)
    elif slug == "ad-iframe.html":
        return render_template('ad-iframe.html', bucket=bucket,**data)
    elif slug == "index.html":
        return render_template('index.html', bucket=bucket,**data)
    else:
        return render_template('404.html', bucket=bucket,**data)

def story_urls():
    # "Generate a URL for every story"
    site = g.current_site
    data = site.get_context()
    stories = data.get('stories', [])
    
    for s in stories:
        yield("cps_abuse.cps_abuse_story", {"slug": s['slug']})

@register_hook('generate')
def register_stories(site, output_root, extra_context):
    # "This runs before tarbell builds the static site"
    site.freezer.register_generator(story_urls)


"""
################################################################
FILTERS & FUNCTIONS //// #######################################
################################################################
"""

@blueprint.app_template_filter('get_story_info')
# @jinja2.contextfilter
def get_story_info(stories, slug):
    """
    Takes a slug and pulls the info for the story.
    """
    for story in stories:
        if story['slug'] == slug:
            return story

@blueprint.app_template_filter('find_sidebar_keywords')
@jinja2.contextfilter
def find_sidebar_keywords(context, text):
    """
    Searches a blob of text for arbitrary keywords, turns them into links to downpage sidebars based on the related story slug
    """
    # print ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"

    stories = context['stories']
    new_text = text # This will be the retval
    svg="<svg><use xlink:href='#link2' /></svg>"
    for story in stories:

        try:
            slug = story['slug']
            keywords = story['sidebar_link_keywords'].split(',')

            for k in keywords:
                # Now loop through keywords looking for them in the story text
                link_label = "Read more about {}".format(k)
                link_opener = "<a class='sidebar-link' aria-label='{0}' title='{0}'".format(link_label) # everything inside the <a> except the HREF 
                k = k.strip()
                # print "Now looking for {}".format(k)
                new_text = re.sub(k, "{} href='#{}'>{}{}</a>".format(link_opener, slug, k, svg), new_text)

        except:
            # Likely cause for error here is missing keywords, which is fine. Move along.
            pass
    
    return new_text

@blueprint.app_template_filter('get_bylines')
@jinja2.contextfilter
def get_bylines(context, byline_slugs):
    """
    takes a list of reporter IDs and pulls byline info from the credits tab
    """
    bylines = byline_slugs.split(',')
    retval = []
    for byline in bylines:
        for credit in context['credits']:
            if byline.strip() == credit['id']:
                retval.append(credit)
    return retval


# Exclude these files from publication
EXCLUDES = ['img/header/src','scripts', '*.md', 'img/src','img/svgs', 'requirements.txt', 'node_modules', '.scss', 'sass', 'base-sass', 'js/src', '*.ai', 'package.json', 'package-lock.json', 'Gruntfile.js', 'out_drive.html', 'out_parsed.txt']

# Spreadsheet cache lifetime in seconds. (Default: 4)
# SPREADSHEET_CACHE_TTL = 4

# Create JSON data at ./data.json, disabled by default
# CREATE_JSON = True

# Get context from a local file or URL. This file can be a CSV or Excel
# spreadsheet file. Relative, absolute, and remote (http/https) paths can be 
# used.
# CONTEXT_SOURCE_FILE = ""

# EXPERIMENTAL: Path to a credentials file to authenticate with Google Drive.
# This is useful for for automated deployment. This option may be replaced by
# command line flag or environment variable. Take care not to commit or publish
# your credentials file.
# CREDENTIALS_PATH = ""

# S3 bucket configuration
S3_BUCKETS = {
    # Provide target -> s3 url pairs, such as:
    #     "mytarget": "mys3url.bucket.url/some/path"
    # then use tarbell publish mytarget to publish to it
    
    "production": "graphics.chicagotribune.com/cps-abuse",
    "staging": "apps.beta.tribapps.com/cps-abuse",
}

# Default template variables
DEFAULT_CONTEXT = {
   'OMNITURE': {   'domain': 'chicagotribune.com',
                    'section': 'news',
                    'sitename': 'Chicago Tribune',
                    'subsection': 'local',
                    'subsubsection': '',
                    'type': 'dataproject'},
    'name': 'cps-abuse',
    'title': 'CPS Abuse'
}