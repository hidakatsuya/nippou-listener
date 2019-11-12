<template>
  <div class="window">
    <Toolbar
      :title="formattedDate"
      :next-day="nextDay"
      :prev-day="prevDay"
      :play="activeItem ? resume : play"
      :pause="pause"
      :stop="stop"
    />
    <div class="window-content">
      <transition
        name="fade"
        mode="out-in"
      >
        <template v-if="loader.state === 'loading'">
          <BeatLoader
            :color="'#aaa'"
            :size="'6px'"
          />
        </template>
        <template v-else-if="loader.state === 'error'">
          <div class="pane padded-more error-message">
            <Message>日報の取得に失敗しました。</Message>
            <div class="error-details">
              {{ loader.error_message }}
            </div>
          </div>
        </template>
        <template v-else-if="loader.state === 'loaded'">
          <Playlist :items="items" />
        </template>
      </transition>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import setting from 'stores/Setting'
import BeatLoader from 'vue-spinner/src/BeatLoader'
import Message from 'Message'
import Playlist from './Playlist'
import Toolbar from './Toolbar'
import PlaylistItem from 'models/PlaylistItem'
import Speaker from 'services/Speaker'
import buildSpeakerNote from 'presenters/SpeakerNote/build'
import NippouLoader from 'services/NippouLoader'

export default {
  components: {
    Toolbar,
    Message,
    Playlist,
    BeatLoader
  },
  data () {
    return {
      loader: new NippouLoader(setting),
      date: moment().subtract(1, 'days').toDate(),
      items: [],
      activeItem: null
    }
  },
  computed: {
    formattedDate () {
      return moment(this.date).format('YYYY-MM-DD')
    }
  },
  watch: {
    date () {
      this.load()
    }
  },
  beforeMount () {
    if (!setting.isValid()) {
      this.$router.push({ name: 'setting' })
    }
  },
  beforeRouteLeave (_to, _from, next) {
    this.stop()
    next(true)
  },
  mounted () {
    this.load()
  },
  methods: {
    async load () {
      const nippous = await this.loader.load(this.date)
      this.items = nippous.map(nippou => new PlaylistItem(nippou))
    },
    play () {
      this.items.forEach(item => {
        const note = buildSpeakerNote(item.nippou, setting.listSectinTitles)
        const speaker = new Speaker(note, window.speechSynthesis)

        speaker.onStart = () => {
          item.nowPlaying()
          this.activeItem = item
        }
        speaker.onEnd = () => {
          item.nowPending()
          this.activeItem = null
        }
        speaker.onResume = () => item.nowPlaying()
        speaker.onPause = () => item.nowPaused()

        speaker.speak()
      })
    },
    resume () {
      window.speechSynthesis.resume()
    },
    stop () {
      window.speechSynthesis.cancel()
    },
    pause () {
      window.speechSynthesis.pause()
    },
    nextDay () {
      this.stop()
      this.date = moment(this.date).add(1, 'days').toDate()
    },
    prevDay () {
      this.stop()
      this.date = moment(this.date).subtract(1, 'days').toDate()
    }
  }
}
</script>

<style scoped>
.fade-enter-active {
  transition: opacity .2s;
}
.fade-enter {
  opacity: 0;
}
.v-spinner {
  margin: auto;
}
.window-content {
  height: 100%;
}
.error-message {
  margin: auto;
}
.error-message .error-details {
  text-align: center;
  color: #aaa;
}
</style>
