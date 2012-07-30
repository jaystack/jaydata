# A sample Guardfile
# More info at https://github.com/guard/guard#readme

# Add files and commands to this file, like the example:
#   watch('file/path') { `command(s)` }
#
guard 'shell' do
  watch(%r"src/.*\.(?:cc|h)") { |m| `node-waf build && mocha` }
  watch(%r"test/.*_test\..*") {|m| `mocha` }
end
