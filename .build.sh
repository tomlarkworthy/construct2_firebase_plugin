#zip our build up
zip firebase.zip firebase/*


#push to a page
if [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  echo -e "Starting to update gh-pages\n"

  #copy plugin data
  cp firebase.zip  $HOME/firebase.zip
  
  #copy demo site
  cp -r demo-site   $HOME/demo-site

  #go to home and setup git
  cd $HOME
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis"

  #using token clone gh-pages branch (instructions at http://sleepycoders.blogspot.se/2013/03/sharing-travis-ci-generated-files.html)
  git clone --quiet --branch=gh-pages https://${GH_TOKEN}@github.com/tomlarkworthy/construct2_firebase_plugin.git  gh-pages > /dev/null

  #go into directory and copy data we're interested in to that directory
  cd gh-pages
  cp $HOME/firebase.zip .
  cp -r $HOME/demo-site .

  #add, commit and push files
  git add -f firebase.zip
  git add -f demo-site
  git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to gh-pages"
  git push -fq origin gh-pages > /dev/null

  echo -e "Done magic with coverage\n"
fi
