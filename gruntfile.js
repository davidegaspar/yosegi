module.exports = function(grunt) {
  require('time-grunt')(grunt);
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    /*
      git
    */
    prompt: {
      branch: {
        options: {
          questions: [
            {
              config: 'branch',
              type: 'input',
              message: 'branch name',
              default: '',
              validate: function(value){return value!=''},
            }
          ]
        }
      },
      bump: {
        options: {
          questions: [
            {
              config: 'bump.inc',
              type: 'list',
              message: 'bump',
              default: '',
              choices: [
                'patch',
                'minor',
                'major',
              ],
              validate: function(value){return value!=''},
            }
          ]
        }
      },
    },
    exec: {
      stage:{cmd: 'git add -A'},
      status:{cmd: 'git status'},
      pushall:{cmd: 'git push --all'},
      pushtags:{cmd: 'git push --tags'},
      commit:{cmd: 'git commit -a -m \'bumped to <%= pkg.version %>\''},
      tag:{cmd: 'git tag -a <%= pkg.version %> -m \'bumped to <%= pkg.version %>\''},
      checkoutmaster:{cmd: 'git checkout master'},
      pushmaster:{cmd: 'git push origin master'},
      checkoutdev:{cmd: 'git checkout dev'},
      pushdev:{cmd: 'git push origin dev'},
      bfeat:{cmd: 'git checkout -b <%= branch %> dev'},
      mfeat:{cmd: 'git merge --no-ff <%= branch %>'},
      dfeat:{cmd: 'git branch -d <%= branch %>'},
      brel:{cmd: 'git checkout -b rel-<%= pkg.version %> dev'},
      mrel:{cmd: 'git merge --no-ff rel-<%= pkg.version %>'},
      drel:{cmd: 'git branch -d rel-<%= pkg.version %>'},
      bfix:{cmd: 'git checkout -b fix-<%= pkg.version %> master'},
      mfix:{cmd: 'git merge --no-ff fix-<%= pkg.version %>'},
      dfix:{cmd: 'git branch -d fix-<%= pkg.version %>'},
      githubmaster:{cmd: 'git push github master'},
      githubtags:{cmd: 'git push github --tags'},
    },
    bump: {
      options: {
        files: ['package.json','bower.json'],
        updateConfigs: ['pkg'],
        commit: false,
        createTag: false,
        push: false,
        globalReplace: false,
        prereleaseName: 'rc',
        regExp: false
      }
    },
    /*
      man
    */
    clean: {
      man:['man/'],
    },
    copy:{
      doc:{
        expand: true,
        cwd: 'doc/md/',
        src:['*.css'],
        dest:'man/',
      }
    },
    markdown: {
      doc: {
        files: [
          {'man/readme.html':'readme.md'},
          {expand: true,cwd: 'doc/',src: '*.md',dest: 'man/',ext: '.html'},
        ],
        options: {
          template: 'doc/md/template.jst',
          markdownOptions: {
            gfm: true,
            highlight: 'auto',
            tables: true,
            breaks: true,
            pedantic: false,
            sanitize: true,
            smartLists: true,
            smartypants: false
          }
        }
      }
    },
  });

  //tasks
  grunt.loadNpmTasks('grunt-prompt');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-markdown');

  /*
    git
  */
  grunt.task.registerTask('bumpit','variable bump',function(){
    grunt.task.run('bump-only:'+grunt.config('bump.inc'));
  });
  grunt.registerTask('feat:open',['prompt:branch','exec:bfeat']);
  grunt.registerTask('feat:close',['prompt:branch','exec:checkoutdev','exec:mfeat','exec:dfeat','exec:pushdev']);
  grunt.registerTask('feat:res',['prompt:branch','exec:dfeat','exec:pushdev']);
  grunt.registerTask('rel:open',['prompt:bump','exec:brel','bumpit','exec:commit']);
  grunt.registerTask('rel:close',['exec:checkoutmaster','exec:mrel','exec:tag','exec:checkoutdev','exec:mrel','exec:drel']);
  grunt.registerTask('fix:open',['prompt:bump','exec:bfix','bumpit','exec:commit']);
  grunt.registerTask('fix:close',['exec:checkoutmaster','exec:mfix','exec:tag','exec:checkoutdev','exec:mfix','exec:dfix']);
  grunt.registerTask('push',['exec:pushall','exec:pushtags']);

  /*
    run
  */
  grunt.registerTask('man',['clean:man','copy:doc','markdown:doc']);
  grunt.registerTask('github',['exec:githubmaster','githubtags']);
  grunt.registerTask('default',['exec:status']);

};
