# -*- coding: utf-8 -*-

"""
Tarbell project configuration
"""

from flask import Blueprint, g, render_template
import os.path # for testing for images
import jinja2 #for context-getting

from itertools import ifilter # For the route
from tarbell.hooks import register_hook #for the route, too

blueprint = Blueprint('cps-abuse', __name__)

# This is so we don't need to make physical html files for each one. 
@blueprint.route('/<slug>/index.html')
def cps_abuse_story(slug):
    """
    Make a page for each bar (side or main), based on the unique slug.
    """

    site = g.current_site

    # get our production bucket for URL building
    bucket = site.project.S3_BUCKETS.get('production', '')
    data = site.get_context()
    rows = data.get('stories', [])

    # get the row we want, defaulting to an empty dictionary
    row = next(ifilter(lambda r: r['slug'] == slug, rows), {})

    # render a template, using the same template environment as everywhere else
    return render_template('subtemplates/_abuse-base.html', bucket=bucket, slug=slug, headline=row["headline"], dek=row["dek"],**data)


"""
################################################################
FILTERS & FUNCTIONS //// #######################################
################################################################
"""



# Google document key for the stories. If not specified, the Archie stuff is skipped
DOC_KEY = "1NNNFdLZvKiSzG3t2NJ0Ls4YIGPaSq1oM5QhiMd-bYFM"

# Google spreadsheet key
SPREADSHEET_KEY = "1SQ_N8fyaimSvjMs62HyATD1CsnssDD7fVWKp14Ta7eQ"

# Exclude these files from publication
EXCLUDES = ['*.md', 'requirements.txt', 'node_modules', 'sass', 'js/src', '*.ai', 'package.json', 'Gruntfile.js']

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