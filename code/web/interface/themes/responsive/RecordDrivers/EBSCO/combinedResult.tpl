{strip}
<div id="record{if $summShortId}{$summShortId}{else}{$summId|escape}{/if}" class="resultsList row">
	{if $showCovers}
		<div class="coversColumn col-xs-3 text-center">
			{if $disableCoverArt != 1}
				<a href="{$summUrl}">
					<img src="{$bookCoverUrl}" class="listResultImage img-thumbnail" alt="{translate text='Cover Image' inAttribute=true}">
				</a>
			{/if}
		</div>
	{/if}
	<div class="{if $showCovers}col-xs-9{else}col-xs-12{/if}">
		<div class="row">
			<div class="col-xs-12">
				<span class="result-index">{$resultIndex})</span>&nbsp;
				<a href="{$summUrl}" class="result-title notranslate">
					{if !$summTitle|removeTrailingPunctuation}{translate text='Title not available'}{else}{$summTitle|removeTrailingPunctuation|truncate:180:"..."|highlight}{/if}
				</a>
			</div>
		</div>

		{if $summAuthor}
			<div class="row">
				<div class="result-label col-tn-3">{translate text='Author'}:</div>
				<div class="col-tn-9 result-value">{$summAuthor|escape}</div>
			</div>
		{/if}

		{if strlen($summFormats)}
			<div class="row">
				<div class="result-label col-tn-3">Format: </div>
				<div class="col-tn-9 result-value">
					<span>{translate text=$summFormats}</span>
				</div>
			</div>
		{/if}

		<div class="row">
			<div class="result-label col-tn-3">{translate text='Full Text'}:</div>
			<div class="col-tn-9 result-value">{if $summHasFullText}Full text available{else}Full text not available{/if}</div>
		</div>

	</div>
</div>
{/strip}