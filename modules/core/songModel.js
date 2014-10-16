define(['modules/core/NoteManager', 'modules/core/BarManager', 'modules/core/ChordManager'], function(NoteManager, BarManager, ChordManager) {
	function SongModel() 
	{
		this.composers = [];
		this.sections = [];
		this.components = [];
		this.setTimeSignature("4/4");
		this.setTonality("C");
		this.addComponent('notes', new NoteManager());
		this.addComponent('bars', new BarManager());
	}

	/////////////////////////
	// Basic getters and setters //
	/////////////////////////

	SongModel.prototype.getTitle = function() {
		return this.title;
	};
	SongModel.prototype.setTitle = function(title) {
		this.title = title;
	};

	SongModel.prototype.getComposer = function(i) {
		i = i || 0;
		return this.composers[i];
	};
	SongModel.prototype.addComposer = function(composer) {
		if (typeof composer !== "undefined") {
			this.composers.push(composer);
			return true;
		}
		return false;
	};
	/*SongModel.prototype.clearComposers = function(composer) {
		if (typeof composer !== "undefined") {
			this.composers = [];
			return true;
		}
		return false;
	};*/

	SongModel.prototype.getSource = function() {
		return this.source;
	};

	SongModel.prototype.setSource = function(source) {
		if (typeof source !== "undefined") {
			this.source = source;
			return true;
		}
		return false;
	};

	SongModel.prototype.getStyle = function() {
		return this.style;
	};

	SongModel.prototype.setStyle = function(style) {
		if (typeof style !== "undefined") {
			this.style = style;
			return true;
		}
		return false;
	};

	SongModel.prototype.setTempo = function(tempo) {
		this.tempo = tempo;
	};
	SongModel.prototype.getTempo = function() {
		return this.tempo;
	};

	SongModel.prototype.getTonality = function() {
		return this.tonality;
	};

	SongModel.prototype.setTonality = function(tonality) {
		if (tonality != null) {
			this.tonality = tonality;
			return true;
		}
		return false;
	};
	/**
	 * @param  {Integer} index  index of the section
	 * @return {SectionModel}
	 */
	SongModel.prototype.getSection = function(index) {
		if (isNaN(index) || index<0 ||index > this.sections.length) {
			throw "getSection - invalid index :"+index;
		}
		return this.sections[index];
	};
	SongModel.prototype.getBars = function() {
		return this.getComponent("bars").getBars();
	};

	SongModel.prototype.getBar = function(index) {
		return this.getComponent("bars").getBar(index);
	};

	SongModel.prototype.addSection = function(sectionsItem) {
		this.sections.push(sectionsItem);
	};

	SongModel.prototype.getSections = function() {
		return this.sections;
	};
		/**
	 * gets component (either chords or notes)
	 * @param  {String} componentTitle must be "chords" or "notes" or "bars"
	 * @return {NoteManager or ChordManager}
	 */
	SongModel.prototype.getComponent = function(componentTitle) {

		if (this.components.hasOwnProperty(componentTitle))
			return this.components[componentTitle];
		else
			return undefined;
	};

	SongModel.prototype.addComponent = function(componentTitle, componentItem) {
		if (!componentItem) return false;
		this.components[componentTitle] = componentItem;
		return true;

	};

	/**
	 * Get the tonality of a bar by looping for each previous bar or by default on song tonality
	 * @param  {int} barNumber
	 * @return {string} eg. C, Bb etc
	 */
	SongModel.prototype.getTonalityAt = function(barNumber) {
		
		if (typeof barNumber === "undefined" || isNaN(barNumber)) {
			throw "invalid barNumber " + barNumber;
		}
		var currentTonality = this.tonality;
		var tonality;
		while (barNumber >= 0) {
			if (this.getBar(barNumber) != null) {
				tonality = this.getBar(barNumber).getTonality();
				if (typeof tonality !== "undefined" && tonality !== '') {
					return tonality;
				}
			}
			barNumber--;
		}
		return currentTonality;
	};

	SongModel.prototype.getTimeSignature = function() {
		return this.timeSignature;
	};

	SongModel.prototype.setTimeSignature = function(timeSignature) {

		if (!timeSignature) {
			throw "invalid timeSignature ";
		}
		this.timeSignature = timeSignature;
	};

	/**
	 * GetTimeSignatureAt returns the time signature at one precise moment defined by the barNumber
	 * @param  {int} barNumber
	 * @return {string} currentTimeSignature like 3/4
	 */
	SongModel.prototype.getTimeSignatureAt = function(barNumber) {
		var currentTimeSignature = this.getTimeSignature();
		var timeSig;
		var sectionNumber = this.getSectionNumberFromBarNumber(barNumber);
		var startBarSection = this.getStartBarNumberFromSectionNumber(sectionNumber);
		// loop in all previous bar in the current section
		while (barNumber >= startBarSection) {
			timeSig = this.getBar(barNumber).getTimeSignature();
			if (typeof timeSig !== "undefined") {
				return timeSig;
			}
			barNumber--;
		}
		// loop in current Section attributes
		timeSig = this.getSection(sectionNumber).getTimeSignature();
		if (typeof timeSig !== "undefined") {
			return timeSig;
		}
		// otherwise returns song timeSig
		return currentTimeSignature;
	};
	/**
	 * 
	 * @param  {Number} barNumber 
	 * @return {Number} section number
	 */
	SongModel.prototype.getSectionNumberFromBarNumber = function(barNumber) {
		if (isNaN(barNumber)){
			throw "barNumber is not a number: "+barNumber;
		}
		var sections = this.getSections();
		var sumBar = 0;
		for (var i = 0; i < sections.length; i++) {
			sumBar += sections[i].getNumberOfBars();
			if (sumBar > barNumber) {
				return i;
			}
		}
	};
		/**
	 * Function return the start bar number of any section, first bar is 0
	 * @param  {int} sectionNumber
	 * @return {int} start Bar Number of section
	 */
	SongModel.prototype.getStartBarNumberFromSectionNumber = function(sectionNumber) {
		if (isNaN(sectionNumber)){
			throw "sectionNumber is not a number: "+sectionNumber;
		}
		var barNumber = 0;
		for (var i = 0, c = sectionNumber; i < c; i++) {
			barNumber += this.getSection(i).getNumberOfBars();
		}
		return barNumber;
	};

	/**
	 * The function returns the number of beats from the timeSig arguments or by default on current timeSignature
	 * @param  {string} timeSig, optional
	 * @return {int} number of beats in a measure  in the unit of the signature. E.g.: for 6/8 -> 6, for 4/4 -> 4 for 2/2 -> 2
	 */
	SongModel.prototype.getBeatsFromTimeSignature = function(timeSig) {
		if (timeSig !== "undefined") {
			return parseInt(timeSig.split("/")[0], null);
		}
		return parseInt(this.timeSignature.split("/")[0], null);
	};

	/**
	 * Function return all components in a given bar number, componentTitle attriubtes is a filter for component title (eg chords, notes...)
	 * @param  {int} barNumber
	 * @param  {string} componentTitle will filter all the result depending the type (chords, notes...)
	 * @return {array} it return an array of the direct object
	 */
	SongModel.prototype.getComponentsAtBarNumber = function(barNumber, componentTitle) {
		var components = [];

		if (!componentTitle || !this.components.hasOwnProperty(componentTitle)) {
			throw 'the item is matching no known type in getComponentsAtBarNumber';
		}

		var modelManager = this.components[componentTitle];
		if (typeof ChordManager !== "undefined" && modelManager instanceof ChordManager) {
			var chords = modelManager.getChordsByBarNumber(barNumber);
			for (var i = 0; i < chords.length; i++) {
				components.push(chords[i]);
			}
		} else if (typeof NoteManager !== "undefined" && modelManager instanceof NoteManager) {
			var notes = components.concat(this.getNotesByBarNumber(modelManager, barNumber));
			for (var j = 0; j < notes.length; j++) {
				components.push(notes[j]);
			}
		}
		return components;
	};
	SongModel.prototype.getNotesByBarNumber = function(noteManager, barNumber) {
		function isSameMeasure(offset, offsetAnt, nMeasureBeats, beatsPerBar, timeSig, songModel) {
			var tu = songModel.getBeatUnitFromTimeSignature(timeSig);

			offset -= nMeasureBeats;
			offsetAnt -= nMeasureBeats;
			var mOffset = offset / (beatsPerBar * tu);
			var mOffsetAnt = offsetAnt / (beatsPerBar * tu);

			var isSameMeasure = (Math.floor(Math.round((mOffset) * 100) / 100) == Math.floor(Math.round((mOffsetAnt) * 100) / 100));
			var error = (!isSameMeasure && mOffset > 1);
			//first round to 2 decimals (to aviod issues with triplets (periodics 0.3333333), then floor to see if they are in the same beat ) 
			return {
				v: isSameMeasure,
				error: error
			};
		}

		var currentBar = 0;
		var beatsPerBar = this.getBeatsFromTimeSignatureAt(currentBar);
		var localTimeSig = this.getTimeSignatureAt(currentBar);
		var nMeasureBeatsAcc = 0; //offset in beats on absolute bars
		var nMeasureBeats = beatsPerBar * this.getBeatUnitFromTimeSignature(localTimeSig);
		var offset = 0,
			offsetAnt = 0;

		var notesBar = [];
		for (var i = 0; i < noteManager.getTotal(); i++) {
			note = noteManager.getNote(i);

			// isSameMeasure=this.isSameMeasure(offset,offsetAnt,nMeasureBeatsAcc,beatsPerBar,localTimeSig);
			var sameMeasure = isSameMeasure(offset, offsetAnt, nMeasureBeatsAcc, beatsPerBar, localTimeSig, this);

			if (!sameMeasure.v) { //will not enter the first time
				currentBar++;
				// if we have finish to compute desired bar we return result
				if (currentBar > barNumber) {
					return notesBar[barNumber];
				}
				nMeasureBeats = beatsPerBar * this.getBeatUnitFromTimeSignature(localTimeSig);
				nMeasureBeatsAcc += nMeasureBeats;
				localTimeSig = this.getTimeSignatureAt(currentBar);
				beatsPerBar = this.getBeatsFromTimeSignatureAt(currentBar);

			}
			if (!notesBar[currentBar]) {
				notesBar[currentBar] = [];
			}
			notesBar[currentBar].push(note);
			offsetAnt = offset;
			offset = noteManager.incrOffset(offset, note.getDuration(nMeasureBeats));
		}

	};

	/**
	 * The function returns the beats unit from the timeSig arguments or by default on current timeSignature
	 * @param  {string} timeSig, optionnal
	 * @return {int} beat unit in a measure
	 */
	SongModel.prototype.getBeatUnitFromTimeSignature = function(timeSig) {
		if (timeSig == null) timeSig = this.timeSignature;
		var u = parseInt(timeSig.split("/")[1], null);
		return 4 / u;
	};
	SongModel.prototype.getBeatsFromTimeSignatureAt = function(barNumber) {
		return this.getBeatsFromTimeSignature(this.getTimeSignatureAt(barNumber));
	}

	return SongModel;
});